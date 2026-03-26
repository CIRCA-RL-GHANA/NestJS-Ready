import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('ride_tracking')
@Index(['rideId'])
@Index(['createdAt'])
export class RideTracking extends BaseEntity {
  @ApiProperty({ description: 'Ride ID' })
  @Column({ type: 'uuid' })
  rideId: string;

  @ApiProperty({ description: 'Current location', type: 'object' })
  @Column({ type: 'jsonb' })
  location: { lat: number; lng: number };

  @ApiProperty({ description: 'Speed in km/h', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  speed: number | null;

  @ApiProperty({ description: 'Heading in degrees', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  heading: number | null;

  @ApiProperty({ description: 'Distance to destination in km', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceToDestination: number | null;

  @ApiProperty({ description: 'ETA to destination in minutes', required: false })
  @Column({ type: 'int', nullable: true })
  etaMinutes: number | null;
}
