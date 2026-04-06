import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavoriteDriverVisibility } from '../entities/favorite-driver.entity';

export class AddFavoriteDriverDto {
  @ApiProperty({
    description: 'Entity (customer) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  entityId: string;

  @ApiProperty({
    description: 'Driver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  driverId: string;

  @ApiProperty({
    description: 'Visibility of favorite driver',
    enum: FavoriteDriverVisibility,
    required: false,
    default: FavoriteDriverVisibility.PRIVATE,
  })
  @IsEnum(FavoriteDriverVisibility)
  @IsOptional()
  visibility?: FavoriteDriverVisibility;

  @ApiProperty({
    description: 'Notes about the driver',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Personal rating for the driver',
    required: false,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  personalRating?: number;
}
