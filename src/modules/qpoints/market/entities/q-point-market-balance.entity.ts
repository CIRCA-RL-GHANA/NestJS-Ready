import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../users/entities/user.entity';

/**
 * Tracks each user's tradeable Q Point balance in the market system.
 * Separate from the internal qpoint_accounts (which track marketplace currency).
 */
@Entity('q_point_market_balances')
export class QPointMarketBalance {
  @ApiProperty({ description: 'User ID (primary key)' })
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Current Q Point balance', example: 1250.5 })
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  balance: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
