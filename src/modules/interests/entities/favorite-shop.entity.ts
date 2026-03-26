import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum AddedByRole {
  OWNER = 'Owner',
  ADMINISTRATOR = 'Administrator',
}

@Entity('favorite_shops')
@Index(['entityId', 'shopId'], { unique: true })
@Index(['entityId'])
@Index(['shopId'])
export class FavoriteShop extends BaseEntity {
  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  entityId: string;

  @ApiProperty({
    description: 'Shop (Branch) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  shopId: string;

  @ApiProperty({
    description: 'Role of person who added the favorite',
    enum: AddedByRole,
    example: AddedByRole.OWNER,
  })
  @Column({ type: 'enum', enum: AddedByRole })
  addedByRole: AddedByRole;

  @ApiProperty({
    description: 'User ID who added the favorite',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  addedById: string;

  @ApiProperty({
    description: 'Notes about the favorite shop',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
