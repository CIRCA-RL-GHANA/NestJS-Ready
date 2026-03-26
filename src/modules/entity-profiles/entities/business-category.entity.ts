import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('business_categories')
@Index(['name'], { unique: true })
export class BusinessCategory extends BaseEntity {
  @ApiProperty({ description: 'Category name', example: 'Retail' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ description: 'Category description', required: false, example: 'Retail and wholesale businesses' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Parent category ID for hierarchical structure', required: false })
  @Column({ type: 'uuid', nullable: true })
  parentCategoryId: string;

  @ApiProperty({ description: 'Whether category is active', example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
