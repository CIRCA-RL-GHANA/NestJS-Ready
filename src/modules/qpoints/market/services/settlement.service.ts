import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  QPointSettlement,
  SettlementStatus,
  SettlementType,
} from '../entities/q-point-settlement.entity';
import { QPointTrade } from '../entities/q-point-trade.entity';
import { PaymentFacilitatorService } from './payment-facilitator.service';
import { MarketNotificationService } from './market-notification.service';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(QPointSettlement)
    private readonly repo: Repository<QPointSettlement>,
    private readonly facilitator: PaymentFacilitatorService,
    private readonly notifications: MarketNotificationService,
  ) {}

  /**
   * Initiate cash settlement for a completed trade.
   * Creates two records (debit buyer, credit seller) and calls the facilitator.
   */
  async createSettlement(
    trade: QPointTrade,
    buyerId: string,
    sellerId: string,
    cashAmount: number,
  ): Promise<void> {
    this.logger.log(
      `Settling trade ${trade.id}: buyer=${buyerId}, seller=${sellerId}, amount=$${cashAmount}`,
    );

    // Create pending records first (idempotently)
    const debitRecord = this.repo.create({
      tradeId: trade.id,
      userId: buyerId,
      amount: cashAmount,
      type: SettlementType.DEBIT,
      status: SettlementStatus.PENDING,
    });

    const creditRecord = this.repo.create({
      tradeId: trade.id,
      userId: sellerId,
      amount: cashAmount,
      type: SettlementType.CREDIT,
      status: SettlementStatus.PENDING,
    });

    const [savedDebit, savedCredit] = await this.repo.save([debitRecord, creditRecord]);

    let transferId: string | undefined;
    try {
      const result = await this.facilitator.transfer(buyerId, sellerId, cashAmount, trade.id);

      if (result.status === 'failed') {
        throw new Error(result.errorMessage ?? 'Facilitator transfer failed');
      }

      transferId = result.transferId;

      // Mark both records as completed
      const now = new Date();
      await this.repo.update(
        { id: savedDebit.id },
        {
          status: SettlementStatus.COMPLETED,
          facilitatorReference: transferId,
          completedAt: now,
        },
      );
      await this.repo.update(
        { id: savedCredit.id },
        {
          status: SettlementStatus.COMPLETED,
          facilitatorReference: transferId,
          completedAt: now,
        },
      );

      this.logger.log(`Settlement completed for trade ${trade.id}: ref=${transferId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Settlement FAILED for trade ${trade.id}: ${msg}`);

      await this.repo.update({ id: savedDebit.id }, { status: SettlementStatus.FAILED });
      await this.repo.update({ id: savedCredit.id }, { status: SettlementStatus.FAILED });

      // Notify both parties of settlement failure
      await this.notifications.notifyUser(
        buyerId,
        'settlement_failed',
        `Cash settlement for trade failed. Ref: ${trade.id}. Support has been alerted.`,
        { tradeId: trade.id },
      );
      await this.notifications.notifyUser(
        sellerId,
        'settlement_failed',
        `Cash settlement for trade failed. Ref: ${trade.id}. Support has been alerted.`,
        { tradeId: trade.id },
      );

      throw new InternalServerErrorException(`Settlement failed for trade ${trade.id}: ${msg}`);
    }
  }

  async getSettlementStatus(settlementId: string): Promise<QPointSettlement> {
    const s = await this.repo.findOne({ where: { id: settlementId } });
    if (!s) throw new InternalServerErrorException(`Settlement ${settlementId} not found`);
    return s;
  }
}
