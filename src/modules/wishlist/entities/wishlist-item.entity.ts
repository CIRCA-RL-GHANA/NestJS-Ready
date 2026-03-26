import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum WishlistStatus {
  PENDING = 'pending',
  PURCHASED = 'purchased',
  CANCELLED = 'cancelled',
}

export enum WishlistCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME = 'home',
  BOOKS = 'books',
  SPORTS = 'sports',
  TRAVEL = 'travel',
  AUTOMOTIVE = 'automotive',
  HEALTH = 'health',
  ENTERTAINMENT = 'entertainment',
  FOOD = 'food',
  OTHER = 'other',
}

@Entity('wishlist_items')
@Index(['userId'])
@Index(['userId', 'status'])
export class WishlistItem extends BaseEntity {
  @ApiProperty({
    description: 'User ID who owns this wishlist item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Item name',
    example: 'MacBook Pro 16-inch',
  })
  @Column({ type: 'varchar', length: 255 })
  item: string;

  @ApiProperty({
    description: 'Item description',
    example: 'Latest model with M3 chip',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Item category',
    enum: WishlistCategory,
    example: WishlistCategory.ELECTRONICS,
  })
  @Column({ type: 'enum', enum: WishlistCategory })
  category: WishlistCategory;

  @ApiProperty({
    description: 'Priority level (1 = Highest, 5 = Lowest)',
    example: 3,
  })
  @Column({ type: 'integer', default: 3 })
  priority: number;

  @ApiProperty({
    description: 'Item status',
    enum: WishlistStatus,
    example: WishlistStatus.PENDING,
  })
  @Column({ type: 'enum', enum: WishlistStatus, default: WishlistStatus.PENDING })
  status: WishlistStatus;

  @ApiProperty({
    description: 'Estimated price',
    example: 2499.99,
    required: false,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedPrice: number | null;

  @ApiProperty({
    description: 'Target purchase date',
    example: '2024-12-25T00:00:00Z',
    required: false,
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  targetDate: Date | null;

  @ApiProperty({
    description: 'Product URL/link',
    example: 'https://www.apple.com/macbook-pro',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string | null;

  @ApiProperty({
    description: 'Image URL',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Date when item was purchased',
    required: false,
  })
  @Column({ type: 'timestamp with time zone', nullable: true })
  purchasedAt: Date | null;

  @ApiProperty({
    description: 'Actual purchase price',
    required: false,
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualPrice: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
