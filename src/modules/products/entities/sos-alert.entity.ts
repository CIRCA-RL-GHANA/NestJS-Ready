import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum SOSStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

@Entity('sos_alerts')
@Index(['userId'])
@Index(['recipientId'])
@Index(['status'])
@Index(['rideId'])
export class SOSAlert extends BaseEntity {
  @ApiProperty({
    description: 'User ID (alert sender)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Recipient ID (alert receiver)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  recipientId: string;

  @ApiProperty({
    description: 'Related ride ID',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  rideId: string | null;

  @ApiProperty({
    description: 'Location coordinates',
    type: 'object',
    required: false,
    example: { latitude: 40.7128, longitude: -74.0060 },
  })
  @Column({ type: 'jsonb', nullable: true })
  location: { latitude: number; longitude: number } | null;

  @ApiProperty({
    description: 'SOS message',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ApiProperty({
    description: 'Alert status',
    enum: SOSStatus,
    example: SOSStatus.ACTIVE,
  })
  @Column({ type: 'enum', enum: SOSStatus, default: SOSStatus.ACTIVE })
  status: SOSStatus;

  @ApiProperty({
    description: 'When the alert was resolved',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @ApiProperty({
    description: 'Resolution notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  resolutionNotes: string | null;
}
