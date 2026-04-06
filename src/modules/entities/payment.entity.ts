import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum PaymentMethod {
  CARD = 'CARD',
  QPOINTS = 'QPOINTS',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

@Entity('payments')
@Index(['userId'])
@Index(['orderId'])
@Index(['status'])
@Index(['createdAt'])
export class Payment extends BaseEntity {
  @ApiProperty({
    description: 'User who made the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Associated order ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  orderId: string | null;

  @ApiProperty({ description: 'Associated ride ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  rideId: string | null;

  @ApiProperty({ description: 'Payment amount', example: 50.0 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'NGN' })
  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: 'External transaction reference', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string | null;

  @ApiProperty({ description: 'Failure reason', required: false })
  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
