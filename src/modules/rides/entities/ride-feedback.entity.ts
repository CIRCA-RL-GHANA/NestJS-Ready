import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('ride_feedback')
@Index(['rideId'])
@Index(['reviewerId'])
export class RideFeedback extends BaseEntity {
  @ApiProperty({ description: 'Ride ID' })
  @Column({ type: 'uuid' })
  rideId: string;

  @ApiProperty({ description: 'Reviewer user ID' })
  @Column({ type: 'uuid' })
  reviewerId: string;

  @ApiProperty({ description: 'Reviewee user ID' })
  @Column({ type: 'uuid' })
  revieweeId: string;

  @ApiProperty({ description: 'Rating (1-5)', example: 4.5 })
  @Column({ type: 'decimal', precision: 3, scale: 2 })
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ApiProperty({ description: 'Review tags', type: [String], required: false })
  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;
}
