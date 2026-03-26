import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum FulfillmentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

@Entity('fulfillment_sessions')
@Index(['fulfillerId'])
@Index(['orderId'])
@Index(['status'])
export class FulfillmentSession extends BaseEntity {
  @ApiProperty({ description: 'Fulfiller ID' })
  @Column({ type: 'uuid' })
  fulfillerId: string;

  @ApiProperty({ description: 'Order ID' })
  @Column({ type: 'uuid' })
  orderId: string;

  @ApiProperty({ description: 'Fulfillment status', enum: FulfillmentStatus })
  @Column({ type: 'enum', enum: FulfillmentStatus, default: FulfillmentStatus.NOT_STARTED })
  status: FulfillmentStatus;

  @ApiProperty({ description: 'When fulfillment started', required: false })
  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @ApiProperty({ description: 'When fulfillment completed', required: false })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ApiProperty({ description: 'Fulfillment notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Items adjusted or substituted', type: 'object', required: false })
  @Column({ type: 'jsonb', nullable: true })
  adjustments: Record<string, any> | null;
}
