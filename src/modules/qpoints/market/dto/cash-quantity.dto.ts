import { IsNumber, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CashQuantityDto {
  @ApiProperty({ description: 'Number of Q Points to buy/sell immediately', example: 100 })
  @IsNumber()
  @IsPositive()
  @Min(0.0001)
  @Max(1_000_000)
  quantity: number;
}
