import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum EngagementType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  VIEW = 'view',
}

export enum EngagementTarget {
  UPDATE = 'update',
  COMMENT = 'comment',
}

@Entity('engagements')
@Index(['userId'])
@Index(['targetType', 'targetId'])
@Index(['type'])
export class Engagement extends BaseEntity {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Target type',
    enum: EngagementTarget,
    example: EngagementTarget.UPDATE,
  })
  @Column({ type: 'enum', enum: EngagementTarget })
  targetType: EngagementTarget;

  @ApiProperty({
    description: 'Target ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  targetId: string;

  @ApiProperty({
    description: 'Engagement type',
    enum: EngagementType,
    example: EngagementType.LIKE,
  })
  @Column({ type: 'enum', enum: EngagementType })
  type: EngagementType;

  @ApiProperty({
    description: 'Engagement metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
