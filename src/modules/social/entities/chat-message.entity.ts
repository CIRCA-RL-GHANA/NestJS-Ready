import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  VOICE_NOTE = 'voice_note',
}

@Entity('chat_messages')
@Index(['sessionId'])
@Index(['senderId'])
@Index(['createdAt'])
export class ChatMessage extends BaseEntity {
  @ApiProperty({
    description: 'Chat session ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  sessionId: string;

  @ApiProperty({
    description: 'Sender ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  senderId: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @ApiProperty({
    description: 'Message content',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ApiProperty({
    description: 'Media URL (for non-text messages)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  mediaUrl: string | null;

  @ApiProperty({
    description: 'Whether message has been read',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @ApiProperty({
    description: 'When message was read',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @ApiProperty({
    description: 'Whether message was edited',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @ApiProperty({
    description: 'Message metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
