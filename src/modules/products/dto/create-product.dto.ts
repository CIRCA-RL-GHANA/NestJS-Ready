import {
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  IsObject,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory, ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Premium Coffee Beans' })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Product category', enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ description: 'Product price', example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Discounted price', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountedPrice?: number;

  @ApiProperty({ description: 'Stock quantity', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiProperty({ description: 'SKU', required: false })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  sku?: string;

  @ApiProperty({ description: 'Product status', enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ description: 'Product weight in kg', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Product dimensions', required: false })
  @IsObject()
  @IsOptional()
  dimensions?: { length: number; width: number; height: number };

  @ApiProperty({ description: 'Product tags', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Product images', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'Whether product is featured', required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
