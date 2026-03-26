import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export enum RecipientType {
  ENTITY = 'Entity',
  BRANCH = 'Branch',
  USER = 'User',
}

@Entity('market_notifications')
@Index(['recipientType', 'recipientId'])
@Index(['read'])
@Index(['type'])
@Index(['createdAt'])
export class MarketNotification extends BaseEntity {
  @ApiProperty({
    description: 'Recipient type',
    enum: RecipientType,
    example: RecipientType.ENTITY,
  })
  @Column({ type: 'enum', enum: RecipientType })
  recipientType: RecipientType;

  @ApiProperty({
    description: 'Recipient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  recipientId: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Market Profile MKT-TECH-2024-001 created successfully.',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.SUCCESS,
  })
  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.INFO })
  type: NotificationType;

  @ApiProperty({
    description: 'Whether notification has been read',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  read: boolean;

  @ApiProperty({
    description: 'Related market profile ID',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  marketProfileId: string | null;

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
