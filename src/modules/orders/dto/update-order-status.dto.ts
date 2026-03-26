import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'New order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ description: 'Fulfiller ID', required: false })
  @IsOptional()
  @IsUUID()
  fulfillerId?: string;

  @ApiProperty({ description: 'Driver ID', required: false })
  @IsOptional()
  @IsUUID()
  driverId?: string;
}
