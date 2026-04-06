import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('wallets')
@Index(['userId'], { unique: true })
@Index(['isActive'])
export class Wallet extends BaseEntity {
  @ApiProperty({ description: 'Wallet owner user ID' })
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @ApiProperty({ description: 'Current balance', example: 0.0 })
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ description: 'Currency code', example: 'NGN' })
  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @ApiProperty({ description: 'Whether the wallet is active', example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
