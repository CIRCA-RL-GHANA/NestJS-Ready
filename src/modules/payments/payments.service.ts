import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { WalletsService } from '../wallets/wallets.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AIFraudService } from '../ai/services/ai-fraud.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly walletsService: WalletsService,
    private readonly aiFraud: AIFraudService,
  ) {}

  async processPayment(dto: CreatePaymentDto): Promise<Payment> {
    // AI fraud pre-check before processing
    const fraudResult = this.aiFraud.scoreTransaction({
      userId: dto.userId,
      amount: dto.amount,
      currency: dto.currency ?? 'NGN',
      paymentMethod: dto.paymentMethod,
    });
    if (fraudResult.blocked) {
      this.logger.warn(
        `Payment blocked by AI fraud check for user ${dto.userId}: ${fraudResult.reason}`,
      );
      throw new BadRequestException(`Transaction blocked: ${fraudResult.reason}`);
    }
    if (fraudResult.reviewFlag) {
      this.logger.warn(`Payment flagged for review (user ${dto.userId}): ${fraudResult.reason}`);
    }

    const payment = this.paymentRepository.create({
      userId: dto.userId,
      orderId: dto.orderId ?? null,
      rideId: dto.rideId ?? null,
      amount: dto.amount,
      currency: dto.currency ?? 'NGN',
      paymentMethod: dto.paymentMethod,
      status: PaymentStatus.PENDING,
    });

    const saved = await this.paymentRepository.save(payment);

    try {
      await this.walletsService.deductBalance(dto.userId, dto.amount);
      await this.paymentRepository.update(saved.id, { status: PaymentStatus.COMPLETED });
      this.logger.log(`Payment ${saved.id} completed for user ${dto.userId}`);

      return { ...saved, status: PaymentStatus.COMPLETED };
    } catch (error) {
      await this.paymentRepository.update(saved.id, {
        status: PaymentStatus.FAILED,
        failureReason: error.message,
      });
      this.logger.error(`Payment ${saved.id} failed: ${error.message}`);
      throw new BadRequestException(`Payment failed: ${error.message}`);
    }
  }

  async refundPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Only completed payments can be refunded`);
    }

    await this.walletsService.addBalance(payment.userId, Number(payment.amount));
    await this.paymentRepository.update(paymentId, { status: PaymentStatus.REFUNDED });

    this.logger.log(
      `Payment ${paymentId} refunded — ${payment.amount} returned to user ${payment.userId}`,
    );

    return { ...payment, status: PaymentStatus.REFUNDED };
  }

  async getPaymentHistory(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return payment;
  }
}
