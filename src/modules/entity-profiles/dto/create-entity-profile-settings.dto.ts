import { IsNotEmpty, IsEnum, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityProfileType, AccessLevel, ComplianceStatus } from '../entities/entity-profile-settings.entity';

export class CreateEntityProfileSettingsDto {
  @ApiProperty({ 
    description: 'Profile type (Entity or Branch)', 
    enum: EntityProfileType,
    example: EntityProfileType.ENTITY 
  })
  @IsNotEmpty()
  @IsEnum(EntityProfileType)
  profileType: EntityProfileType;

  @ApiProperty({ description: 'Profile ID (Entity or Branch ID)', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  profileId: string;

  @ApiProperty({ description: 'Business location/address', required: false, example: '123 Main St, City' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Business category ID', required: false })
  @IsOptional()
  @IsUUID()
  businessCategoryId?: string;

  @ApiProperty({ 
    description: 'Visibility/Access level', 
    enum: AccessLevel,
    required: false,
    example: AccessLevel.PRIVATE 
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  visibility?: AccessLevel;

  @ApiProperty({ description: 'Service scope description', required: false, example: 'Food delivery and catering' })
  @IsOptional()
  @IsString()
  serviceScope?: string;

  @ApiProperty({ description: 'Manager user ID (for branches)', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: 'Classification/type', required: false, example: 'Restaurant' })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiProperty({ description: 'Additional metadata', type: 'object', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
