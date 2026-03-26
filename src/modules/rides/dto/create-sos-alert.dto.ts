import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSOSAlertDto {
  @ApiProperty({ description: 'Ride ID' })
  @IsUUID()
  rideId: string;

  @ApiProperty({ description: 'Alert message', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
