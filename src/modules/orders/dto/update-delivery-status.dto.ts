import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../entities/delivery.entity';

export class UpdateDeliveryStatusDto {
  @ApiProperty({ description: 'Delivery status', enum: DeliveryStatus })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty({ description: 'Proof of delivery URL', required: false })
  @IsOptional()
  @IsString()
  proofOfDelivery?: string;

  @ApiProperty({ description: 'Recipient name', required: false })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ description: 'Delivery notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;
}
