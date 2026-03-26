import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlannerTransaction, TransactionType } from './entities/planner-transaction.entity';
import { CreatePlannerTransactionDto, UpdatePlannerTransactionDto } from './dto';
import { EmailService } from '@/common/services/email.service';
import { AIInsightsService, FinancialInsight, SpendingPattern, RevenueForecaste } from '../ai/services/ai-insights.service';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface MonthlySummary extends FinancialSummary {
  month: string;
  year: number;
}

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(
    @InjectRepository(PlannerTransaction)
    private readonly transactionRepository: Repository<PlannerTransaction>,
    private readonly emailService: EmailService,
    private readonly aiInsights: AIInsightsService,
  ) {}

  async addTransaction(
    userId: string,
    createDto: CreatePlannerTransactionDto,
  ): Promise<PlannerTransaction> {
    try {
      const transaction = this.transactionRepository.create({
        userId,
        ...createDto,
      });

      const savedTransaction = await this.transactionRepository.save(transaction);
      this.logger.log(
        `${savedTransaction.type} transaction created: ${savedTransaction.description} for user ${userId}`,
      );

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Transaction Added', `${transaction.type} transaction of $${transaction.amount} added.`);

      return savedTransaction;
    } catch (error) {
      this.logger.error(`Failed to add transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTransactions(userId: string): Promise<PlannerTransaction[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: { userId },
        order: { transactionDate: 'DESC' },
      });

      this.logger.log(`Retrieved ${transactions.length} transactions for user ${userId}`);
      return transactions;
    } catch (error) {
      this.logger.error(`Failed to fetch transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTransactionById(id: string, userId: string): Promise<PlannerTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async getTransactionsByMonth(userId: string, month: string, year: number): Promise<PlannerTransaction[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: { userId, month, year },
        order: { transactionDate: 'DESC' },
      });

      this.logger.log(
        `Retrieved ${transactions.length} transactions for user ${userId} for ${month}/${year}`,
      );
      return transactions;
    } catch (error) {
      this.logger.error(`Failed to fetch transactions by month: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSummary(userId: string): Promise<FinancialSummary> {
    try {
      const transactions = await this.transactionRepository.find({
        where: { userId },
      });

      const totalIncome = transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalIncome - totalExpenses;

      const incomeCount = transactions.filter((t) => t.type === TransactionType.INCOME).length;
      const expenseCount = transactions.filter((t) => t.type === TransactionType.EXPENSE).length;

      this.logger.log(`Financial summary generated for user ${userId}`);

      return {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: transactions.length,
        incomeCount,
        expenseCount,
      };
    } catch (error) {
      this.logger.error(`Failed to generate summary: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMonthlySummary(userId: string, month: string, year: number): Promise<MonthlySummary> {
    try {
      const transactions = await this.getTransactionsByMonth(userId, month, year);

      const totalIncome = transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalIncome - totalExpenses;

      const incomeCount = transactions.filter((t) => t.type === TransactionType.INCOME).length;
      const expenseCount = transactions.filter((t) => t.type === TransactionType.EXPENSE).length;

      this.logger.log(`Monthly summary generated for user ${userId} for ${month}/${year}`);

      return {
        month,
        year,
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: transactions.length,
        incomeCount,
        expenseCount,
      };
    } catch (error) {
      this.logger.error(`Failed to generate monthly summary: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateTransaction(
    id: string,
    userId: string,
    updateDto: UpdatePlannerTransactionDto,
  ): Promise<PlannerTransaction> {
    try {
      const transaction = await this.getTransactionById(id, userId);

      Object.assign(transaction, updateDto);
      const updatedTransaction = await this.transactionRepository.save(transaction);

      this.logger.log(`Transaction ${id} updated for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Transaction Updated', 'Your transaction has been updated.');

      return updatedTransaction;
    } catch (error) {
      this.logger.error(`Failed to update transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteTransaction(id: string, userId: string): Promise<void> {
    try {
      const transaction = await this.getTransactionById(id, userId);
      await this.transactionRepository.remove(transaction);

      this.logger.log(`Transaction ${id} deleted for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Transaction Deleted', 'Your transaction has been removed.');
    } catch (error) {
      this.logger.error(`Failed to delete transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTransactionsByType(userId: string, type: TransactionType): Promise<PlannerTransaction[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: { userId, type },
        order: { transactionDate: 'DESC' },
      });

      this.logger.log(`Retrieved ${transactions.length} ${type} transactions for user ${userId}`);
      return transactions;
    } catch (error) {
      this.logger.error(`Failed to fetch transactions by type: ${error.message}`, error.stack);
      throw error;
    }
  }
}
