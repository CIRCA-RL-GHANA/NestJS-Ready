import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum GoTransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum GoTransactionCategory {
  RIDE = 'ride',
  ORDER = 'order',
  TOPUP = 'topup',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export enum GoTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('go_transactions')
@Index(['userId'])
@Index(['walletId'])
@Index(['status'])
@Index(['createdAt'])
export class GoTransaction extends BaseEntity {
  @ApiProperty({ description: 'User ID' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Wallet ID' })
  @Column({ type: 'uuid' })
  walletId: string;

  @ApiProperty({ description: 'Transaction type', enum: GoTransactionType })
  @Column({ type: 'enum', enum: GoTransactionType })
  type: GoTransactionType;

  @ApiProperty({ description: 'Amount', example: 150.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @ApiProperty({ description: 'Wallet balance after transaction' })
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  balanceAfter: number;

  @ApiProperty({ description: 'Transaction description' })
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @ApiProperty({ description: 'Transaction category', enum: GoTransactionCategory })
  @Column({ type: 'enum', enum: GoTransactionCategory, default: GoTransactionCategory.OTHER })
  category: GoTransactionCategory;

  @ApiProperty({ description: 'Transaction status', enum: GoTransactionStatus })
  @Column({ type: 'enum', enum: GoTransactionStatus, default: GoTransactionStatus.COMPLETED })
  status: GoTransactionStatus;

  @ApiProperty({ description: 'Reference to linked entity (orderId, rideId, etc.)', required: false })
  @Column({ type: 'uuid', nullable: true })
  referenceId: string | null;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
