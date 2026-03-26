import { IsEnum, IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WishlistStatus } from '../entities/wishlist-item.entity';

export class MarkAsPurchasedDto {
  @ApiPropertyOptional({
    description: 'Actual purchase price',
    example: 2399.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  actualPrice?: number;

  @ApiPropertyOptional({
    description: 'Purchase date',
    example: '2024-01-15T10:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  purchasedAt?: Date;
}

export class UpdateWishlistStatusDto {
  @ApiPropertyOptional({
    description: 'Item status',
    enum: WishlistStatus,
    example: WishlistStatus.PURCHASED,
  })
  @IsEnum(WishlistStatus)
  status: WishlistStatus;
}
