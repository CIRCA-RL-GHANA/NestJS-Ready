import { IsUUID, IsEnum, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../entities/vehicle-media.entity';

export class CreateVehicleMediaDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.PHOTO,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'Media URL',
    example: 'https://storage.genieinprompt.app/vehicle-123.jpg',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Media description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
