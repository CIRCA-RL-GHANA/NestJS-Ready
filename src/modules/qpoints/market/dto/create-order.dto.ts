import { IsEnum, IsNumber, IsPositive, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QPointOrderType } from '../entities/q-point-order.entity';

export class CreateOrderDto {
  @ApiProperty({ enum: QPointOrderType, description: 'buy or sell' })
  @IsEnum(QPointOrderType)
  type: QPointOrderType;

  @ApiProperty({ description: 'Price per Q Point in USD', example: 0.95 })
  @IsNumber()
  @IsPositive()
  @Min(0.0001)
  @Max(9999)
  price: number;

  @ApiProperty({ description: 'Quantity of Q Points', example: 100 })
  @IsNumber()
  @IsPositive()
  @Min(0.0001)
  @Max(1_000_000)
  quantity: number;
}
