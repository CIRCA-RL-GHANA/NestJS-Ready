import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum SOSStatus {
  ACTIVE = 'active',
  RESPONDED = 'responded',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
}

@Entity('ride_sos_alerts')
@Index(['rideId'])
@Index(['userId'])
@Index(['status'])
export class RideSOSAlert extends BaseEntity {
  @ApiProperty({ description: 'Ride ID' })
  @Column({ type: 'uuid' })
  rideId: string;

  @ApiProperty({ description: 'User who triggered SOS' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'SOS status', enum: SOSStatus })
  @Column({ type: 'enum', enum: SOSStatus, default: SOSStatus.ACTIVE })
  status: SOSStatus;

  @ApiProperty({ description: 'Alert location', type: 'object' })
  @Column({ type: 'jsonb' })
  location: { lat: number; lng: number };

  @ApiProperty({ description: 'Alert message', required: false })
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ApiProperty({ description: 'Emergency contacts notified', type: [String], required: false })
  @Column({ type: 'jsonb', nullable: true })
  contactsNotified: string[] | null;

  @ApiProperty({ description: 'When SOS was responded to', required: false })
  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @ApiProperty({ description: 'When SOS was resolved', required: false })
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @ApiProperty({ description: 'Resolution notes', required: false })
  @Column({ type: 'text', nullable: true })
  resolutionNotes: string | null;
}
