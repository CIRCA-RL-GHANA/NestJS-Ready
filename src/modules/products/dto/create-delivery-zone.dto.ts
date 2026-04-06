import {
  IsUUID,
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsObject,
  IsOptional,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryZoneDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Zone name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Zone center coordinates' })
  @IsObject()
  location: { latitude: number; longitude: number };

  @ApiProperty({ description: 'Radius in meters', example: 3218, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  radiusMeters?: number;

  @ApiProperty({ description: 'Delivery fee in cedis' })
  @IsNumber()
  @Min(0)
  feeCedis: number;

  @ApiProperty({ description: 'Minimum order amount', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @ApiProperty({ description: 'Estimated delivery time in minutes', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDeliveryTime?: number;

  @ApiProperty({ description: 'Whether zone is active', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ description: 'Operating hours', required: false })
  @IsObject()
  @IsOptional()
  operatingHours?: Record<string, any>;
}
