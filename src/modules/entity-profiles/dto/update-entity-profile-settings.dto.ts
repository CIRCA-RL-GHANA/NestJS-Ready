import { IsOptional, IsEnum, IsUUID, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessLevel, ComplianceStatus } from '../entities/entity-profile-settings.entity';

export class UpdateEntityProfileSettingsDto {
  @ApiProperty({
    description: 'Business location/address',
    required: false,
    example: '123 Main St, City',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Business category ID', required: false })
  @IsOptional()
  @IsUUID()
  businessCategoryId?: string;

  @ApiProperty({
    description: 'Compliance status',
    enum: ComplianceStatus,
    required: false,
    example: ComplianceStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  complianceStatus?: ComplianceStatus;

  @ApiProperty({
    description: 'Visibility/Access level',
    enum: AccessLevel,
    required: false,
    example: AccessLevel.PUBLIC,
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  visibility?: AccessLevel;

  @ApiProperty({
    description: 'Service scope description',
    required: false,
    example: 'Food delivery and catering',
  })
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

  @ApiProperty({ description: 'Whether profile is verified', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
