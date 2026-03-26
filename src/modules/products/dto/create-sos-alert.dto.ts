import { IsUUID, IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SOSStatus } from '../entities/sos-alert.entity';

export class CreateSOSAlertDto {
  @ApiProperty({ description: 'User ID (alert sender)' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Recipient ID (alert receiver)' })
  @IsUUID()
  recipientId: string;

  @ApiProperty({ description: 'Related ride ID', required: false })
  @IsUUID()
  @IsOptional()
  rideId?: string;

  @ApiProperty({ description: 'Location coordinates', required: false })
  @IsObject()
  @IsOptional()
  location?: { latitude: number; longitude: number };

  @ApiProperty({ description: 'SOS message', required: false })
  @IsString()
  @IsOptional()
  message?: string;
}
