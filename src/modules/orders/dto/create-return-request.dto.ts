import { IsUUID, IsEnum, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReturnReason } from '../entities/return-request.entity';

export class CreateReturnRequestDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Return reason', enum: ReturnReason })
  @IsEnum(ReturnReason)
  reason: ReturnReason;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Item IDs to return', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  itemIds: string[];
}
