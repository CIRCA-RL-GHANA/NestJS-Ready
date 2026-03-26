import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsPhoneNumber,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtherEntityType } from '../entities/entity.entity';

export class CreateOtherEntityDto {
  @ApiProperty({
    description: 'Entity name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of other entity',
    enum: OtherEntityType,
    example: OtherEntityType.COMPANY,
  })
  @IsEnum(OtherEntityType)
  @IsNotEmpty()
  type: OtherEntityType;

  @ApiProperty({
    description: 'Phone number for the entity',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Wire ID for the entity',
    example: '@acmecorp',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^@[a-zA-Z0-9_]+$/, {
    message: 'Wire ID must start with @ and contain only letters, numbers, and underscores',
  })
  wireId: string;

  @ApiProperty({
    description: 'User ID of the entity owner/creator',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Subscription plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  subscriptionPlanId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { registrationNumber: 'REG-12345' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
