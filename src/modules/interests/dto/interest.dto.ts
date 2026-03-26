import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsInt, Min, Max, IsArray, IsObject } from 'class-validator';
import { TargetType } from '../entities/interest.entity';

export class AddInterestDto {
  @ApiProperty({
    description: 'Owner (user/entity) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  ownerId: string;

  @ApiProperty({
    description: 'Target ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({
    description: 'Target type',
    enum: TargetType,
    example: TargetType.PRODUCT,
  })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({
    description: 'Interest level (1-10)',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  interestLevel?: number;

  @ApiProperty({
    description: 'Tags associated with this interest',
    type: 'array',
    required: false,
    example: ['technology', 'innovation'],
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RemoveInterestDto {
  @ApiProperty({
    description: 'Owner ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  ownerId: string;

  @ApiProperty({
    description: 'Target ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  targetId: string;

  @ApiProperty({
    description: 'Target type',
    enum: TargetType,
  })
  @IsEnum(TargetType)
  targetType: TargetType;
}
