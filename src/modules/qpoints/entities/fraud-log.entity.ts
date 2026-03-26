import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum FraudDetectionReason {
  UNUSUAL_AMOUNT = 'Unusual Amount',
  UNUSUAL_FREQUENCY = 'Unusual Frequency',
  HIGH_VELOCITY = 'High Velocity',
  UNUSUAL_LOCATION = 'Unusual Location',
  DEVICE_MISMATCH = 'Device Mismatch',
  PATTERN_ANOMALY = 'Pattern Anomaly',
  BLACKLISTED_IP = 'Blacklisted IP',
  MULTIPLE_FAILURES = 'Multiple Failures',
  SUSPICIOUS_BEHAVIOR = 'Suspicious Behavior',
}

export enum FraudActionTaken {
  FLAGGED = 'Flagged',
  BLOCKED = 'Blocked',
  MANUAL_REVIEW = 'Manual Review',
  VERIFIED = 'Verified',
  FALSE_POSITIVE = 'False Positive',
}

@Entity('fraud_logs')
@Index(['transactionId'])
@Index(['accountId'])
@Index(['fraudDetectionReason'])
@Index(['actionTaken'])
@Index(['createdAt'])
export class FraudLog extends BaseEntity {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  transactionId: string;

  @ApiProperty({
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  accountId: string;

  @ApiProperty({
    description: 'Fraud detection reason',
    enum: FraudDetectionReason,
    example: FraudDetectionReason.UNUSUAL_AMOUNT,
  })
  @Column({ type: 'enum', enum: FraudDetectionReason })
  fraudDetectionReason: FraudDetectionReason;

  @ApiProperty({
    description: 'Action taken',
    enum: FraudActionTaken,
    example: FraudActionTaken.FLAGGED,
  })
  @Column({ type: 'enum', enum: FraudActionTaken })
  actionTaken: FraudActionTaken;

  @ApiProperty({
    description: 'Risk score at time of detection',
    example: 75,
  })
  @Column({ type: 'int' })
  riskScore: number;

  @ApiProperty({
    description: 'Detection details',
    type: 'object',
  })
  @Column({ type: 'jsonb' })
  detectionDetails: Record<string, any>;

  @ApiProperty({
    description: 'IP address',
    required: false,
  })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @ApiProperty({
    description: 'Device fingerprint',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceFingerprint: string | null;

  @ApiProperty({
    description: 'Geolocation data',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  geolocation: Record<string, any> | null;

  @ApiProperty({
    description: 'Reviewed by user ID',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @ApiProperty({
    description: 'Review timestamp',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({
    description: 'Review notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reviewNotes: string | null;
}
