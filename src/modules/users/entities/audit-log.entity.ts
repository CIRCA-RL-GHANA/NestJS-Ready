import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @ApiProperty({
    description: 'Action performed',
    example: 'User Registration',
  })
  @Column()
  @Index()
  action: string;

  @ApiProperty({
    description: 'Status of the action',
    example: 'SUCCESS',
  })
  @Column()
  status: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @ApiProperty({
    description: 'Additional metadata about the action',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'IP address from which the action was performed',
    example: '192.168.1.1',
    required: false,
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @ApiProperty({
    description: 'User agent string',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @ApiProperty({
    description: 'Timestamp when the action occurred',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
