import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { PlaceVisibility } from '../entities/place.entity';

export class UpdatePlaceDto {
  @ApiProperty({
    description: 'Place name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty({
    description: 'Place visibility',
    enum: PlaceVisibility,
    required: false,
  })
  @IsOptional()
  @IsEnum(PlaceVisibility)
  visibility?: PlaceVisibility;

  @ApiProperty({
    description: 'Place category',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  category?: string;

  @ApiProperty({
    description: 'Place location/address',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  location?: string;

  @ApiProperty({
    description: 'Geographic coordinates',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  coordinates?: { latitude: number; longitude: number };

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Place tags',
    type: 'array',
    required: false,
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({
    description: 'Place rating (0-5)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}
