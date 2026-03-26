import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositQPointsDto {
  @ApiProperty({ description: 'Account ID to deposit into', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Amount to deposit', example: 100.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment reference/method', example: 'Bank Transfer' })
  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @ApiProperty({ description: 'Additional metadata', type: 'object', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
