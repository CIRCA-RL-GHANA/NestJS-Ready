import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  // Income categories
  SALARY = 'salary',
  FREELANCE = 'freelance',
  INVESTMENT = 'investment',
  GIFT = 'gift',
  OTHER_INCOME = 'other_income',

  // Expense categories
  FOOD = 'food',
  TRANSPORTATION = 'transportation',
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  SHOPPING = 'shopping',
  OTHER_EXPENSE = 'other_expense',
}

@Entity('planner_transactions')
@Index(['userId'])
@Index(['userId', 'type'])
@Index(['month', 'year'])
export class PlannerTransaction extends BaseEntity {
  @ApiProperty({
    description: 'User ID who owns this transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction amount',
    example: 150.5,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Transaction category',
    enum: TransactionCategory,
    example: TransactionCategory.FOOD,
  })
  @Column({ type: 'enum', enum: TransactionCategory })
  category: TransactionCategory;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Grocery shopping at Whole Foods',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Month of transaction (MM)',
    example: '01',
  })
  @Column({ type: 'varchar', length: 2 })
  month: string;

  @ApiProperty({
    description: 'Year of transaction',
    example: 2024,
  })
  @Column({ type: 'integer' })
  year: number;

  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15T10:00:00Z',
  })
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @ApiProperty({
    description: 'Payment method',
    example: 'Credit Card',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string | null;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
