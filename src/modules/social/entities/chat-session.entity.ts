import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('chat_sessions')
@Index(['participant1Id', 'participant2Id'])
@Index(['participant1Id'])
@Index(['participant2Id'])
@Index(['isActive'])
export class ChatSession extends BaseEntity {
  @ApiProperty({
    description: 'First participant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  participant1Id: string;

  @ApiProperty({
    description: 'Second participant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  participant2Id: string;

  @ApiProperty({
    description: 'Last message content preview',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  lastMessage: string | null;

  @ApiProperty({
    description: 'Last message timestamp',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @ApiProperty({
    description: 'Unread count for participant 1',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  unreadCount1: number;

  @ApiProperty({
    description: 'Unread count for participant 2',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  unreadCount2: number;

  @ApiProperty({
    description: 'Whether session is active',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Session metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
