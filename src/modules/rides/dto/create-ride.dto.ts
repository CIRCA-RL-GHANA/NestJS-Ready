import { IsUUID, IsEnum, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RideType } from '../entities/ride.entity';

class LocationDto {
  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -74.0060 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: '123 Main St, New York' })
  @IsString()
  address: string;
}

export class CreateRideDto {
  @ApiProperty({ description: 'Ride type', enum: RideType })
  @IsEnum(RideType)
  rideType: RideType;

  @ApiProperty({ description: 'Pickup location', type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  pickupLocation: LocationDto;

  @ApiProperty({ description: 'Dropoff location', type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  dropoffLocation: LocationDto;

  @ApiProperty({ description: 'Scheduled pickup time', required: false })
  @IsOptional()
  scheduledPickupTime?: Date;

  @ApiProperty({ description: 'Voice note URL', required: false })
  @IsOptional()
  @IsString()
  voiceNoteUrl?: string;

  @ApiProperty({ description: 'Special instructions', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
