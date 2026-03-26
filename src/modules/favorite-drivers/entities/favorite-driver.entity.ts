import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum FavoriteDriverVisibility {
  PRIVATE = 'Private',
  PUBLIC = 'Public',
}

@Entity('favorite_drivers')
@Index(['entityId', 'driverId'], { unique: true })
@Index(['entityId'])
@Index(['driverId'])
@Index(['addedById'])
export class FavoriteDriver extends BaseEntity {
  @ApiProperty({
    description: 'Entity (customer) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  entityId: string;

  @ApiProperty({
    description: 'Driver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  driverId: string;

  @ApiProperty({
    description: 'User who added the driver to favorites',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  addedById: string;

  @ApiProperty({
    description: 'Whether ride history has been verified',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  rideHistoryVerified: boolean;

  @ApiProperty({
    description: 'Visibility of favorite driver',
    enum: FavoriteDriverVisibility,
    example: FavoriteDriverVisibility.PRIVATE,
  })
  @Column({
    type: 'enum',
    enum: FavoriteDriverVisibility,
    default: FavoriteDriverVisibility.PRIVATE,
  })
  visibility: FavoriteDriverVisibility;

  @ApiProperty({
    description: 'Notes about the driver',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Driver rating (as perceived by entity)',
    required: false,
    example: 4.8,
  })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  personalRating: number | null;
}
