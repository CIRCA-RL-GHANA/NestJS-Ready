import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
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

export class CreatePlaceDto {
  @ApiProperty({
    description: 'Unique place identifier',
    example: 'PLC-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  uniquePlaceId: string;

  @ApiProperty({
    description: 'Place name',
    example: 'Central Park',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Place visibility',
    enum: PlaceVisibility,
    example: PlaceVisibility.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(PlaceVisibility)
  visibility?: PlaceVisibility;

  @ApiProperty({
    description: 'Place category',
    example: 'Park',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  category: string;

  @ApiProperty({
    description: 'Place location/address',
    example: 'New York, NY',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  location: string;

  @ApiProperty({
    description: 'Geographic coordinates',
    type: 'object',
    required: false,
    example: {
      latitude: 40.785091,
      longitude: -73.968285,
    },
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
    example: ['outdoor', 'recreation'],
  })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
