import { IsString, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModelType } from '../entities/ai-model.entity';

export class CreateAIModelDto {
  @ApiProperty({ description: 'Model name', example: 'product-recommendation-v1' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Model type', enum: ModelType })
  @IsEnum(ModelType)
  modelType: ModelType;

  @ApiProperty({ description: 'Model version', example: '1.0.0' })
  @IsString()
  version: string;

  @ApiProperty({ description: 'Model description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Model configuration', type: 'object' })
  @IsObject()
  config: Record<string, any>;
}
