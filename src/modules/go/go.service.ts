import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoTransaction, GoTransactionCategory, GoTransactionType } from './entities/go-transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { AIInsightsService } from '../ai/services/ai-insights.service';

@Injectable()
export class GoService {
  private readonly logger = new Logger(GoService.name);

  constructor(
    @InjectRepository(GoTransaction)
    private readonly transactionRepository: Repository<GoTransaction>,
    private readonly walletsService: WalletsService,
    private readonly aiInsights: AIInsightsService,
  ) {}

  async getWalletSummary(userId: string) {
    const wallet = await this.walletsService.getWallet(userId);

    const [totalIn, totalOut] = await Promise.all([
      this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.userId = :userId AND t.type = :type', { userId, type: GoTransactionType.CREDIT })
        .getRawOne(),
      this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.userId = :userId AND t.type = :type', { userId, type: GoTransactionType.DEBIT })
        .getRawOne(),
    ]);

    return {
      wallet,
      totalIn: Number(totalIn?.total ?? 0),
      totalOut: Number(totalOut?.total ?? 0),
    };
  }

  async getTransactions(
    userId: string,
    options?: {
      type?: GoTransactionType;
      category?: GoTransactionCategory;
      limit?: number;
      offset?: number;
    },
  ): Promise<GoTransaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .orderBy('t.createdAt', 'DESC')
      .take(options?.limit ?? 20)
      .skip(options?.offset ?? 0);

    if (options?.type) {
      query.andWhere('t.type = :type', { type: options.type });
    }

    if (options?.category) {
      query.andWhere('t.category = :category', { category: options.category });
    }

    return query.getMany();
  }

  async getTransaction(transactionId: string, userId: string): Promise<GoTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    return transaction;
  }

  async recordTransaction(data: {
    userId: string;
    walletId: string;
    type: GoTransactionType;
    amount: number;
    currency: string;
    balanceAfter: number;
    description: string;
    category: GoTransactionCategory;
    referenceId?: string;
    metadata?: Record<string, any>;
  }): Promise<GoTransaction> {
    const transaction = this.transactionRepository.create(data);
    const saved = await this.transactionRepository.save(transaction);
    this.logger.debug(`Transaction ${saved.id} recorded for user ${data.userId}`);
    return saved;
  }

  async topUp(userId: string, amount: number, description: string): Promise<GoTransaction> {
    const wallet = await this.walletsService.addBalance(userId, amount);

    return this.recordTransaction({
      userId,
      walletId: wallet.id,
      type: GoTransactionType.CREDIT,
      amount,
      currency: wallet.currency,
      balanceAfter: Number(wallet.balance),
      description,
      category: GoTransactionCategory.TOPUP,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AI-POWERED METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Return AI-generated spending insights + revenue forecast for a user's
   * GO wallet transaction history.
   */
  async getAISpendingInsights(userId: string) {
    const txns = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    if (txns.length === 0) {
      return { insights: [], spendingPattern: null, forecast: null };
    }

    const income = txns
      .filter(t => t.type === GoTransactionType.CREDIT)
      .map(t => ({ amount: Number(t.amount), category: t.category, date: t.createdAt.toISOString() }));

    const expenses = txns
      .filter(t => t.type === GoTransactionType.DEBIT)
      .map(t => ({ amount: Number(t.amount), category: t.category, date: t.createdAt.toISOString() }));

    const allForSpending = txns.map(t => ({
      amount:   Number(t.amount),
      category: t.category ?? 'other',
      date:     t.createdAt.toISOString(),
      type:     t.type === GoTransactionType.CREDIT ? 'credit' as const : 'debit' as const,
    }));

    const dailySales = txns
      .filter(t => t.type === GoTransactionType.CREDIT)
      .slice(0, 30)
      .map(t => Number(t.amount));

    const [insights, spendingPattern, forecast] = await Promise.all([
      this.aiInsights.analyseFinancials(income, expenses),
      this.aiInsights.getSpendingPattern(allForSpending),
      dailySales.length >= 3 ? this.aiInsights.forecastRevenue(dailySales) : Promise.resolve(null),
    ]);

    this.logger.debug(`AI spending insights generated for user ${userId}: ${insights.length} insights`);
    return { insights, spendingPattern, forecast };
  }
}
