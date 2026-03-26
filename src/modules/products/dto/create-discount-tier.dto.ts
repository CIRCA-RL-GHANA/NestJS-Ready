import { IsUUID, IsString, IsNumber, IsInt, IsBoolean, IsOptional, IsDateString, IsArray, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscountTierDto {
  @ApiProperty({ description: 'Product ID', required: false })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ description: 'Branch ID', required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ description: 'Discount name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Discount description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Discount percentage', example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({ description: 'Minimum quantity', example: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  minQuantity?: number;

  @ApiProperty({ description: 'Maximum quantity', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxQuantity?: number;

  @ApiProperty({ description: 'Minimum purchase amount', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchaseAmount?: number;

  @ApiProperty({ description: 'Valid from date' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'Valid to date' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ description: 'Whether discount is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Applicable customer tiers', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCustomerTiers?: string[];
}
