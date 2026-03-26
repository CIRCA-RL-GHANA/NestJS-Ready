import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Basic' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Plan description', required: false, example: 'Basic tier with standard features' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Booster points allocation', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  boosterPointsAllocation: number;

  @ApiProperty({ description: 'Monthly cost in Q-Points', example: 50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyCostQPoints: number;

  @ApiProperty({ description: 'Maximum branches allowed', required: false, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBranches?: number;

  @ApiProperty({ description: 'Maximum staff members allowed', required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStaff?: number;

  @ApiProperty({ description: 'Whether plan is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Features included in plan', type: [String], required: false })
  @IsOptional()
  @IsArray()
  features?: string[];
}
