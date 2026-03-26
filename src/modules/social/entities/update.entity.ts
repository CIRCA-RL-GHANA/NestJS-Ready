import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum UpdateVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
}

@Entity('updates')
@Index(['authorId'])
@Index(['visibility'])
@Index(['createdAt'])
export class Update extends BaseEntity {
  @ApiProperty({
    description: 'Author (creator) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  authorId: string;

  @ApiProperty({
    description: 'Update content',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: 'Update visibility',
    enum: UpdateVisibility,
    example: UpdateVisibility.PUBLIC,
  })
  @Column({ type: 'enum', enum: UpdateVisibility, default: UpdateVisibility.PUBLIC })
  visibility: UpdateVisibility;

  @ApiProperty({
    description: 'Media attachments',
    type: [String],
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  media: string[] | null;

  @ApiProperty({
    description: 'Like count',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @ApiProperty({
    description: 'Comment count',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @ApiProperty({
    description: 'Share count',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @ApiProperty({
    description: 'Whether update is pinned',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @ApiProperty({
    description: 'Tagged user IDs',
    type: [String],
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  taggedUsers: string[] | null;

  @ApiProperty({
    description: 'Update metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
