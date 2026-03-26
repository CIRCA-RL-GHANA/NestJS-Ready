import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum InferenceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('ai_inferences')
@Index(['modelId'])
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class AIInference extends BaseEntity {
  @ApiProperty({ description: 'Model ID' })
  @Column({ type: 'uuid' })
  modelId: string;

  @ApiProperty({ description: 'User ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty({ description: 'Inference status', enum: InferenceStatus })
  @Column({ type: 'enum', enum: InferenceStatus, default: InferenceStatus.PENDING })
  status: InferenceStatus;

  @ApiProperty({ description: 'Input data', type: 'object' })
  @Column({ type: 'jsonb' })
  input: Record<string, any>;

  @ApiProperty({ description: 'Output data', type: 'object', required: false })
  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, any> | null;

  @ApiProperty({ description: 'Confidence score', required: false })
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidence: number | null;

  @ApiProperty({ description: 'Processing time in ms', required: false })
  @Column({ type: 'int', nullable: true })
  processingTimeMs: number | null;

  @ApiProperty({ description: 'Error message', required: false })
  @Column({ type: 'text', nullable: true })
  error: string | null;

  @ApiProperty({ description: 'Inference metadata', type: 'object', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
