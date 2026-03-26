import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RideStatus } from '../entities/ride.entity';

export class UpdateRideStatusDto {
  @ApiProperty({ description: 'New ride status', enum: RideStatus })
  @IsEnum(RideStatus)
  status: RideStatus;
}
