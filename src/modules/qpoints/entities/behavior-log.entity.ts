import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum BehaviorType {
  LOGIN_ATTEMPT = 'Login Attempt',
  TRANSACTION_ATTEMPT = 'Transaction Attempt',
  ACCOUNT_ACCESS = 'Account Access',
  PROFILE_UPDATE = 'Profile Update',
  FAILED_TRANSACTION = 'Failed Transaction',
  HIGH_VALUE_TRANSACTION = 'High Value Transaction',
  RAPID_TRANSACTIONS = 'Rapid Transactions',
  UNUSUAL_PATTERN = 'Unusual Pattern',
}

@Entity('behavior_logs')
@Index(['accountId'])
@Index(['userId'])
@Index(['behaviorType'])
@Index(['createdAt'])
export class BehaviorLog extends BaseEntity {
  @ApiProperty({
    description: 'Account ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  accountId: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Behavior type',
    enum: BehaviorType,
    example: BehaviorType.TRANSACTION_ATTEMPT,
  })
  @Column({ type: 'enum', enum: BehaviorType })
  behaviorType: BehaviorType;

  @ApiProperty({
    description: 'Transaction ID if applicable',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  transactionId: string | null;

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
    description: 'Behavior details',
    type: 'object',
  })
  @Column({ type: 'jsonb' })
  behaviorDetails: Record<string, any>;

  @ApiProperty({
    description: 'Whether behavior is suspicious',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  suspicious: boolean;

  @ApiProperty({
    description: 'Risk score associated with this behavior',
    example: 30,
  })
  @Column({ type: 'int', default: 0 })
  riskScore: number;
}
