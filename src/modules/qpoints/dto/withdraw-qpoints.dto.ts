import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawQPointsDto {
  @ApiProperty({ description: 'Account ID to withdraw from', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Amount to withdraw', example: 75.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Withdrawal method', example: 'Bank Account' })
  @IsNotEmpty()
  @IsString()
  withdrawalMethod: string;

  @ApiProperty({ description: 'Destination details (bank account, etc)', example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
