import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ProfileVisibility } from '../entities/market-profile.entity';

export class UpdateMarketProfileDto {
  @ApiProperty({
    description: 'Demographic metrics',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  demographicMetrics?: Record<string, any>;

  @ApiProperty({
    description: 'Business category',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessCategory?: string;

  @ApiProperty({
    description: 'Advertisement exposure rules',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  advertisementExposureRules?: Record<string, any>;

  @ApiProperty({
    description: 'Profile visibility',
    enum: ProfileVisibility,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  visibility?: ProfileVisibility;

  @ApiProperty({
    description: 'AI-refined segments',
    type: 'array',
    required: false,
  })
  @IsOptional()
  @IsArray()
  refinedSegments?: string[];

  @ApiProperty({
    description: 'Engagement analytics',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  engagementAnalytics?: Record<string, any>;
}
