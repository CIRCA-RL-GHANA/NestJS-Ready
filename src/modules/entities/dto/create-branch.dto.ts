import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsPhoneNumber,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchType } from '../entities/branch.entity';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Entity ID this branch belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Branch name',
    example: 'Downtown Store',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Branch type/classification',
    enum: BranchType,
    example: BranchType.SHOP,
  })
  @IsEnum(BranchType)
  @IsNotEmpty()
  type: BranchType;

  @ApiProperty({
    description: 'Phone number for the branch',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Branch location/address',
    example: '123 Main St, City, State 12345',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    description: 'Branch manager user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({
    description: 'Subscription plan ID for the branch',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  subscriptionPlanId?: string;

  @ApiPropertyOptional({
    description: 'Service scope description',
    example: 'Retail sales, customer support',
  })
  @IsString()
  @IsOptional()
  serviceScope?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { capacity: 50, parkingAvailable: true },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
