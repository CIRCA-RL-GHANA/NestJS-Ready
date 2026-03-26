import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WishlistCategory } from '../entities/wishlist-item.entity';

export class CreateWishlistItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'MacBook Pro 16-inch',
  })
  @IsString()
  @IsNotEmpty()
  item: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Latest model with M3 chip',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Item category',
    enum: WishlistCategory,
    example: WishlistCategory.ELECTRONICS,
  })
  @IsEnum(WishlistCategory)
  category: WishlistCategory;

  @ApiPropertyOptional({
    description: 'Priority level (1 = Highest, 5 = Lowest)',
    example: 3,
    default: 3,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Estimated price',
    example: 2499.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  estimatedPrice?: number;

  @ApiPropertyOptional({
    description: 'Target purchase date',
    example: '2024-12-25T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  targetDate?: Date;

  @ApiPropertyOptional({
    description: 'Product URL/link',
    example: 'https://www.apple.com/macbook-pro',
  })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Image URL',
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
