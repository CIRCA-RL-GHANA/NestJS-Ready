import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaritalStatus } from '../entities/statement.entity';

export class CreateStatementDto {
  @ApiPropertyOptional({
    description: 'Lifestyle description',
    example: 'Active, health-conscious, enjoys outdoor activities',
  })
  @IsString()
  @IsOptional()
  lifestyle?: string;

  @ApiPropertyOptional({
    description: 'Family details and background',
    example: 'Married with two children, parents live nearby',
  })
  @IsString()
  @IsOptional()
  familyDetails?: string;

  @ApiPropertyOptional({
    description: 'Marital status',
    enum: MaritalStatus,
  })
  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({
    description: 'Number of children',
    example: 2,
  })
  @IsInt()
  @Min(0)
  @Max(20)
  @IsOptional()
  numberOfChildren?: number;

  @ApiPropertyOptional({
    description: 'Occupation',
    example: 'Software Engineer',
  })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Hobbies and interests',
    example: 'Reading, hiking, photography',
  })
  @IsString()
  @IsOptional()
  hobbies?: string;

  @ApiPropertyOptional({
    description: 'Health information',
    example: 'No major health concerns, exercises regularly',
  })
  @IsString()
  @IsOptional()
  healthInfo?: string;

  @ApiPropertyOptional({
    description: 'Education background',
    example: "Bachelor's in Computer Science",
  })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiPropertyOptional({
    description: 'Personal goals',
    example: 'Save for retirement, travel more, learn new skills',
  })
  @IsString()
  @IsOptional()
  personalGoals?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
