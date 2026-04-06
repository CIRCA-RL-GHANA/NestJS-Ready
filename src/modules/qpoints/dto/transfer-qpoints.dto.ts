import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferQPointsDto {
  @ApiProperty({ description: 'Source account ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  sourceAccountId: string;

  @ApiProperty({ description: 'Destination account ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  destinationAccountId: string;

  @ApiProperty({ description: 'Amount to transfer', example: 50.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transfer description',
    required: false,
    example: 'Payment for services',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Additional metadata', type: 'object', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
