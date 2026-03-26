import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('update_comments')
@Index(['updateId'])
@Index(['authorId'])
@Index(['createdAt'])
export class UpdateComment extends BaseEntity {
  @ApiProperty({
    description: 'Update ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  updateId: string;

  @ApiProperty({
    description: 'Comment author ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  authorId: string;

  @ApiProperty({
    description: 'Comment content',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: 'Parent comment ID (for replies)',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  parentCommentId: string | null;

  @ApiProperty({
    description: 'Like count',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @ApiProperty({
    description: 'Whether comment was edited',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isEdited: boolean;
}
