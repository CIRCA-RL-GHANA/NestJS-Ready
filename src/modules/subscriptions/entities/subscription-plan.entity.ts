import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

export enum SubscriptionTier {
  FREE = 'Free',
  BASIC = 'Basic',
  BOOSTER = 'Booster',
}

@Entity('subscription_plans')
@Index(['name'], { unique: true })
export class SubscriptionPlan extends BaseEntity {
  @ApiProperty({ description: 'Plan name', enum: SubscriptionTier, example: SubscriptionTier.FREE })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @ApiProperty({ description: 'Plan description', required: false, example: 'Free tier with basic features' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Booster points allocation', example: '100.00' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  boosterPointsAllocation: number;

  @ApiProperty({ description: 'Monthly cost in Q-Points', example: '50.00' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyCostQPoints: number;

  @ApiProperty({ description: 'Maximum branches allowed', example: 5 })
  @Column({ type: 'int', nullable: true })
  maxBranches: number;

  @ApiProperty({ description: 'Maximum staff members allowed', example: 10 })
  @Column({ type: 'int', nullable: true })
  maxStaff: number;

  @ApiProperty({ description: 'Whether plan is active', example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Features included in plan', type: [String], required: false })
  @Column({ type: 'jsonb', nullable: true })
  features: string[];
}
