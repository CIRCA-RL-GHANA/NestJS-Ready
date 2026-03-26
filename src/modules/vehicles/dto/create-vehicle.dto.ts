import { IsString, IsUUID, IsInt, IsNumber, IsEnum, IsOptional, IsArray, IsObject, ValidateNested, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VehicleStatus } from '../entities/vehicle.entity';

class CoordinatesDto {
  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0060 })
  @IsNumber()
  longitude: number;
}

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle type',
    example: 'Sedan',
  })
  @IsString()
  @Length(1, 50)
  type: string;

  @ApiProperty({
    description: 'Plate number',
    example: 'ABC-1234',
  })
  @IsString()
  @Length(1, 20)
  plateNumber: string;

  @ApiProperty({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Passenger capacity',
    example: 4,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({
    description: 'Base fare',
    example: 50.00,
  })
  @IsNumber()
  @Min(0)
  baseFare: number;

  @ApiProperty({
    description: 'Per kilometer rate',
    example: 15.00,
  })
  @IsNumber()
  @Min(0)
  perKmRate: number;

  @ApiProperty({
    description: 'Wait charge per minute',
    example: 2.50,
  })
  @IsNumber()
  @Min(0)
  waitChargePerMinute: number;

  @ApiProperty({
    description: 'Vehicle status',
    enum: VehicleStatus,
    required: false,
    default: VehicleStatus.ACTIVE,
  })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiProperty({
    description: 'Sleep coordinates (where vehicle parks)',
    type: CoordinatesDto,
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  sleepCoordinates?: CoordinatesDto;

  @ApiProperty({
    description: 'Operational zones',
    type: [String],
    required: false,
    example: ['Downtown', 'Airport', 'Suburbs'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  operationalZones?: string[];

  @ApiProperty({
    description: 'Vehicle model',
    required: false,
  })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  model?: string;

  @ApiProperty({
    description: 'Vehicle year',
    required: false,
  })
  @IsInt()
  @Min(1900)
  @IsOptional()
  year?: number;

  @ApiProperty({
    description: 'Vehicle color',
    required: false,
  })
  @IsString()
  @Length(1, 50)
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
