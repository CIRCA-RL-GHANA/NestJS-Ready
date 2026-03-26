import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

export enum EntityProfileType {
  ENTITY = 'Entity',
  BRANCH = 'Branch',
}

export enum AccessLevel {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
  RESTRICTED = 'Restricted',
}

export enum ComplianceStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  SUSPENDED = 'Suspended',
}

@Entity('entity_profile_settings')
@Index(['profileType', 'profileId'], { unique: true })
export class EntityProfileSettings extends BaseEntity {
  @ApiProperty({ 
    description: 'Profile type (Entity or Branch)', 
    enum: EntityProfileType,
    example: EntityProfileType.ENTITY 
  })
  @Column({ type: 'enum', enum: EntityProfileType })
  profileType: EntityProfileType;

  @ApiProperty({ description: 'Profile ID (Entity or Branch ID)', example: 'uuid' })
  @Column({ type: 'uuid' })
  profileId: string;

  @ApiProperty({ description: 'Business location/address', required: false, example: '123 Main St, City' })
  @Column({ type: 'text', nullable: true })
  location: string;

  @ApiProperty({ description: 'Business category ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  businessCategoryId: string;

  @ApiProperty({ 
    description: 'Compliance status', 
    enum: ComplianceStatus,
    example: ComplianceStatus.PENDING 
  })
  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.PENDING })
  complianceStatus: ComplianceStatus;

  @ApiProperty({ 
    description: 'Visibility/Access level', 
    enum: AccessLevel,
    example: AccessLevel.PRIVATE 
  })
  @Column({ type: 'enum', enum: AccessLevel, default: AccessLevel.PRIVATE })
  visibility: AccessLevel;

  @ApiProperty({ description: 'Service scope description', required: false, example: 'Food delivery and catering' })
  @Column({ type: 'text', nullable: true })
  serviceScope: string;

  @ApiProperty({ description: 'Manager user ID (for branches)', required: false })
  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @ApiProperty({ description: 'Classification/type', required: false, example: 'Restaurant' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  classification: string;

  @ApiProperty({ description: 'Additional metadata', type: 'object', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Whether profile is verified', example: false })
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;
}
