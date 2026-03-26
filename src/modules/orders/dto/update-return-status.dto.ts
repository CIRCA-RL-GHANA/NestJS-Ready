import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReturnStatus } from '../entities/return-request.entity';

export class UpdateReturnStatusDto {
  @ApiProperty({ description: 'Return status', enum: ReturnStatus })
  @IsEnum(ReturnStatus)
  status: ReturnStatus;

  @ApiProperty({ description: 'Refund amount', required: false })
  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @ApiProperty({ description: 'Rejection reason', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
