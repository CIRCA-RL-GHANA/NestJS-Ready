import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum ConnectionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  BLOCKED = 'blocked',
}

@Entity('connection_requests')
@Index(['senderId', 'receiverId'], { unique: true })
@Index(['senderId'])
@Index(['receiverId'])
@Index(['status'])
export class ConnectionRequest extends BaseEntity {
  @ApiProperty({
    description: 'Sender (requester) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  senderId: string;

  @ApiProperty({
    description: 'Receiver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  receiverId: string;

  @ApiProperty({
    description: 'Connection status',
    enum: ConnectionStatus,
    example: ConnectionStatus.PENDING,
  })
  @Column({ type: 'enum', enum: ConnectionStatus, default: ConnectionStatus.PENDING })
  status: ConnectionStatus;

  @ApiProperty({
    description: 'Message included with the request',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  message: string | null;

  @ApiProperty({
    description: 'Response timestamp',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @ApiProperty({
    description: 'Response notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  responseNotes: string | null;

  @ApiProperty({
    description: 'Connection strength/quality score',
    example: 0,
    required: false,
  })
  @Column({ type: 'int', default: 0 })
  connectionScore: number;

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
