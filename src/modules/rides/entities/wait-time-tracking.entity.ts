import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('wait_time_tracking')
@Index(['rideId'])
@Index(['userId'])
export class WaitTimeTracking extends BaseEntity {
  @ApiProperty({ description: 'Ride ID' })
  @Column({ type: 'uuid' })
  rideId: string;

  @ApiProperty({ description: 'User who waited (rider or driver)' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Wait start time' })
  @Column({ type: 'timestamp' })
  waitStartTime: Date;

  @ApiProperty({ description: 'Wait end time', required: false })
  @Column({ type: 'timestamp', nullable: true })
  waitEndTime: Date | null;

  @ApiProperty({ description: 'Total wait time in minutes', required: false })
  @Column({ type: 'int', nullable: true })
  waitMinutes: number | null;

  @ApiProperty({ description: 'Charge per minute in QPoints' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  chargePerMinute: number;

  @ApiProperty({ description: 'Total charge in QPoints', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCharge: number | null;

  @ApiProperty({ description: 'Whether charge was applied' })
  @Column({ type: 'boolean', default: false })
  chargeApplied: boolean;

  @ApiProperty({ description: 'Wait reason', required: false })
  @Column({ type: 'text', nullable: true })
  reason: string | null;
}
