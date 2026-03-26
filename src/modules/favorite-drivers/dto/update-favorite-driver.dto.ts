import { IsEnum, IsOptional, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavoriteDriverVisibility } from '../entities/favorite-driver.entity';

export class UpdateFavoriteDriverDto {
  @ApiProperty({
    description: 'Visibility of favorite driver',
    enum: FavoriteDriverVisibility,
    required: false,
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

  @ApiProperty({
    description: 'Whether ride history has been verified',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  rideHistoryVerified?: boolean;
}
