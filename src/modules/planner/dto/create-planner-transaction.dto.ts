import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionCategory } from '../entities/planner-transaction.entity';

export class CreatePlannerTransactionDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction amount',
    example: 150.50,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transaction category',
    enum: TransactionCategory,
    example: TransactionCategory.FOOD,
  })
  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Grocery shopping at Whole Foods',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Month of transaction (MM)',
    example: '01',
  })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Month must be in MM format (01-12)' })
  month: string;

  @ApiProperty({
    description: 'Year of transaction',
    example: 2024,
  })
  @IsNumber()
  @Min(2000)
  year: number;

  @ApiPropertyOptional({
    description: 'Payment method',
    example: 'Credit Card',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
