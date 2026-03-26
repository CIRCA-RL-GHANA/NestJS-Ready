import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum EntryType {
  DEBIT = 'Debit',
  CREDIT = 'Credit',
}

@Entity('journal_entries')
@Index(['transactionId'])
@Index(['ledgerAccountId'])
@Index(['entryType'])
@Index(['createdAt'])
export class JournalEntry extends BaseEntity {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  transactionId: string;

  @ApiProperty({
    description: 'General Ledger account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  ledgerAccountId: string;

  @ApiProperty({
    description: 'Entry type',
    enum: EntryType,
    example: EntryType.DEBIT,
  })
  @Column({ type: 'enum', enum: EntryType })
  entryType: EntryType;

  @ApiProperty({
    description: 'Amount',
    example: 100.00,
  })
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Entry description',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'User who created the entry',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
