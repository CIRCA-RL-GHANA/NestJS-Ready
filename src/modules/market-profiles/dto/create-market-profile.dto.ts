import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsEnum, IsOptional } from 'class-validator';
import { ProfileVisibility } from '../entities/market-profile.entity';

export class CreateMarketProfileDto {
  @ApiProperty({
    description: 'Unique market identifier',
    example: 'MKT-TECH-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  uniqueMarketIdentifier: string;

  @ApiProperty({
    description: 'Demographic metrics (age, gender, location, interests)',
    type: 'object',
    example: {
      ageRange: '18-35',
      gender: ['Male', 'Female'],
      region: 'North America',
      interests: ['Technology', 'Innovation'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  demographicMetrics: Record<string, any>;

  @ApiProperty({
    description: 'Business category',
    example: 'Technology',
  })
  @IsString()
  @IsNotEmpty()
  businessCategory: string;

  @ApiProperty({
    description: 'Advertisement exposure rules',
    type: 'object',
    required: false,
    example: {
      priority: 'High',
      maxDailyExposure: 1000,
      targetingCriteria: {
        interests: ['Tech', 'Innovation'],
        locations: ['Urban'],
      },
    },
  })
  @IsOptional()
  @IsObject()
  advertisementExposureRules?: Record<string, any>;

  @ApiProperty({
    description: 'Profile visibility',
    enum: ProfileVisibility,
    example: ProfileVisibility.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  visibility?: ProfileVisibility;
}
