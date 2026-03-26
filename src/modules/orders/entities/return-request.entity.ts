import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  REFUNDED = 'refunded',
}

export enum ReturnReason {
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  QUALITY_ISSUE = 'quality_issue',
  CHANGE_OF_MIND = 'change_of_mind',
  OTHER = 'other',
}

@Entity('return_requests')
@Index(['orderId'])
@Index(['requestedBy'])
@Index(['status'])
export class ReturnRequest extends BaseEntity {
  @ApiProperty({ description: 'Order ID' })
  @Column({ type: 'uuid' })
  orderId: string;

  @ApiProperty({ description: 'User who requested return' })
  @Column({ type: 'uuid' })
  requestedBy: string;

  @ApiProperty({ description: 'Return reason', enum: ReturnReason })
  @Column({ type: 'enum', enum: ReturnReason })
  reason: ReturnReason;

  @ApiProperty({ description: 'Return status', enum: ReturnStatus })
  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.REQUESTED })
  status: ReturnStatus;

  @ApiProperty({ description: 'Detailed description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Return item IDs', type: [String] })
  @Column({ type: 'jsonb' })
  itemIds: string[];

  @ApiProperty({ description: 'Evidence photos/videos', type: [String], required: false })
  @Column({ type: 'jsonb', nullable: true })
  evidence: string[] | null;

  @ApiProperty({ description: 'Refund amount', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount: number | null;

  @ApiProperty({ description: 'When return was approved', required: false })
  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @ApiProperty({ description: 'Rejection reason', required: false })
  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}
