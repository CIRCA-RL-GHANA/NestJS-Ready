import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../users/entities/user.entity';
import { QPointOrder } from './q-point-order.entity';

@Entity('q_point_trades')
export class QPointTrade {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'buy_order_id', type: 'uuid' })
  buyOrderId: string;

  @ManyToOne(() => QPointOrder, { nullable: false })
  @JoinColumn({ name: 'buy_order_id' })
  buyOrder: QPointOrder;

  @Column({ name: 'sell_order_id', type: 'uuid' })
  sellOrderId: string;

  @ManyToOne(() => QPointOrder, { nullable: false })
  @JoinColumn({ name: 'sell_order_id' })
  sellOrder: QPointOrder;

  @ApiProperty({ description: 'Execution price', example: 0.99 })
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  price: number;

  @ApiProperty({ description: 'Number of Q Points traded', example: 50 })
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  quantity: number;

  @Column({ name: 'buyer_id', type: 'uuid' })
  @Index()
  buyerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'seller_id', type: 'uuid' })
  @Index()
  sellerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;

  /** Total cash value of this trade */
  get cashValue(): number {
    return Number(this.price) * Number(this.quantity);
  }
}
