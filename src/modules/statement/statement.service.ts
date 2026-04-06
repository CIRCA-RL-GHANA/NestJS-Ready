import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statement } from './entities/statement.entity';
import { CreateStatementDto, UpdateStatementDto } from './dto';
import { EmailService } from '@/common/services/email.service';
import { AINlpService } from '../ai/services/ai-nlp.service';

@Injectable()
export class StatementService {
  private readonly logger = new Logger(StatementService.name);

  constructor(
    @InjectRepository(Statement)
    private readonly statementRepository: Repository<Statement>,
    private readonly emailService: EmailService,
    private readonly aiNlp: AINlpService,
  ) {}

  async createOrUpdateStatement(userId: string, createDto: CreateStatementDto): Promise<Statement> {
    try {
      let statement = await this.statementRepository.findOne({
        where: { userId },
      });

      if (statement) {
        Object.assign(statement, createDto);
        this.logger.log(`Updating statement for user ${userId}`);
      } else {
        statement = this.statementRepository.create({
          userId,
          ...createDto,
        });
        this.logger.log(`Creating new statement for user ${userId}`);
      }

      // AI: enrich with NLP keywords extracted from the bio/statement text
      const bioText = (createDto as any).bio ?? (createDto as any).content ?? '';
      if (bioText.trim().length > 10) {
        try {
          const keywords = this.aiNlp.extractKeywords(bioText, 8);
          const sentiment = this.aiNlp.analyzeSentiment(bioText);
          (statement as any).metadata = {
            ...((statement as any).metadata ?? {}),
            ai: {
              keywords,
              sentimentLabel: sentiment.label,
              sentimentScore: sentiment.score,
              analysedAt: new Date().toISOString(),
            },
          };
        } catch (e) {
          this.logger.warn(`AI statement analysis failed: ${e.message}`);
        }
      }

      const savedStatement = await this.statementRepository.save(statement);
      return savedStatement;
    } catch (error) {
      this.logger.error(`Failed to create/update statement: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStatement(userId: string): Promise<Statement> {
    const statement = await this.statementRepository.findOne({
      where: { userId },
    });

    if (!statement) {
      throw new NotFoundException(`Statement for user ${userId} not found`);
    }

    this.logger.log(`Statement retrieved for user ${userId}`);
    return statement;
  }

  async updateStatement(userId: string, updateDto: UpdateStatementDto): Promise<Statement> {
    try {
      const statement = await this.getStatement(userId);

      Object.assign(statement, updateDto);
      const updatedStatement = await this.statementRepository.save(statement);

      this.logger.log(`Statement updated for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Profile Updated', 'Your personal statement has been updated.');

      return updatedStatement;
    } catch (error) {
      this.logger.error(`Failed to update statement: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteStatement(userId: string): Promise<void> {
    try {
      const statement = await this.getStatement(userId);
      await this.statementRepository.remove(statement);

      this.logger.log(`Statement deleted for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Profile Deleted', 'Your personal statement has been removed.');
    } catch (error) {
      this.logger.error(`Failed to delete statement: ${error.message}`, error.stack);
      throw error;
    }
  }

  async hasStatement(userId: string): Promise<boolean> {
    const count = await this.statementRepository.count({
      where: { userId },
    });
    return count > 0;
  }

  /**
   * AI-powered summary of a user's personal statement — extracts top keywords,
   * intent, sentiment, and a condensed TL;DR summary.
   */
  async getAISummary(userId: string) {
    const statement = await this.getStatement(userId);
    const text = (statement as any).bio ?? (statement as any).content ?? '';
    if (!text.trim()) {
      return { summary: null, keywords: [], sentiment: null };
    }
    const [nlpSummary, keywords, sentiment] = await Promise.all([
      Promise.resolve(this.aiNlp.summariseText(text)),
      Promise.resolve(this.aiNlp.extractKeywords(text, 10)),
      Promise.resolve(this.aiNlp.analyzeSentiment(text)),
    ]);
    return { summary: nlpSummary.summary, keywords, sentiment };
  }
}
