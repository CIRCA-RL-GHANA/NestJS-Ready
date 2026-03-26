import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('vehicle_media')
@Index(['vehicleId'])
@Index(['type'])
export class VehicleMedia extends BaseEntity {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  vehicleId: string;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.PHOTO,
  })
  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @ApiProperty({
    description: 'Media URL',
    example: 'https://storage.example.com/vehicle-123.jpg',
  })
  @Column({ type: 'text' })
  url: string;

  @ApiProperty({
    description: 'Media description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'User who uploaded the media',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  uploadedBy: string;
}
