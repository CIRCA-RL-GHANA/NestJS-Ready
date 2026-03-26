import { IsUUID, IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecommendationType } from '../entities/ai-recommendation.entity';

export class GetRecommendationsDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Recommendation type', enum: RecommendationType })
  @IsEnum(RecommendationType)
  recommendationType: RecommendationType;

  @ApiProperty({ description: 'Number of recommendations', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
