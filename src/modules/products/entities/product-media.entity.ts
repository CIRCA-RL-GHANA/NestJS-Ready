import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('product_media')
@Index(['productId'])
@Index(['type'])
export class ProductMedia extends BaseEntity {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @ApiProperty({
    description: 'Media URL',
    example: 'https://storage.example.com/products/image1.jpg',
  })
  @Column({ type: 'text' })
  url: string;

  @ApiProperty({
    description: 'Thumbnail URL',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @ApiProperty({
    description: 'Media description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether this is the primary media',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;
}
