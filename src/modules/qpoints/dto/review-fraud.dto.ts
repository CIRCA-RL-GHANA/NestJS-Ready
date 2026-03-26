import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewFraudDto {
  @ApiProperty({
    description: 'Transaction ID to review',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  transactionId: string;

  @ApiProperty({
    description: 'Whether to approve the transaction',
    example: true,
  })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({
    description: 'Review notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
