import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum HeyYaStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('heyya_requests')
@Index(['senderId'])
@Index(['recipientId'])
@Index(['status'])
export class HeyYaRequest extends BaseEntity {
  @ApiProperty({
    description: 'Sender (initiator) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  senderId: string;

  @ApiProperty({
    description: 'Recipient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  recipientId: string;

  @ApiProperty({
    description: 'Request message',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ApiProperty({
    description: 'Request status',
    enum: HeyYaStatus,
    example: HeyYaStatus.PENDING,
  })
  @Column({ type: 'enum', enum: HeyYaStatus, default: HeyYaStatus.PENDING })
  status: HeyYaStatus;

  @ApiProperty({
    description: 'When request expires',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({
    description: 'When request was responded to',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date | null;
}
