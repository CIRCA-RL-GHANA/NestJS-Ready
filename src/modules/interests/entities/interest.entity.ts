import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum TargetType {
  ENTITY = 'Entity',
  OTHER_ENTITY = 'OtherEntity',
  BRANCH = 'Branch',
  PRODUCT = 'Product',
}

export enum InterestAddedByRole {
  OWNER = 'Owner',
  ADMINISTRATOR = 'Administrator',
  SOCIAL_OFFICER = 'SocialOfficer',
  BRANCH_MANAGER = 'BranchManager',
}

@Entity('interests')
@Index(['ownerId', 'targetId', 'targetType'], { unique: true })
@Index(['ownerId'])
@Index(['targetId'])
@Index(['targetType'])
export class Interest extends BaseEntity {
  @ApiProperty({
    description: 'Owner (user/entity) ID who has the interest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  ownerId: string;

  @ApiProperty({
    description: 'Target ID (entity, branch, product, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  targetId: string;

  @ApiProperty({
    description: 'Target type',
    enum: TargetType,
    example: TargetType.PRODUCT,
  })
  @Column({ type: 'enum', enum: TargetType })
  targetType: TargetType;

  @ApiProperty({
    description: 'Role of person who added the interest',
    enum: InterestAddedByRole,
    example: InterestAddedByRole.OWNER,
  })
  @Column({ type: 'enum', enum: InterestAddedByRole })
  addedByRole: InterestAddedByRole;

  @ApiProperty({
    description: 'Interest level (1-10)',
    example: 7,
    required: false,
  })
  @Column({ type: 'int', default: 5 })
  interestLevel: number;

  @ApiProperty({
    description: 'Tags associated with this interest',
    type: 'array',
    required: false,
    example: ['technology', 'innovation'],
  })
  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
