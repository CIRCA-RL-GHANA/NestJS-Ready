import { IsUUID, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInferenceDto {
  @ApiProperty({ description: 'Model ID' })
  @IsUUID()
  modelId: string;

  @ApiProperty({ description: 'Input data', type: 'object' })
  @IsObject()
  input: Record<string, any>;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Metadata', type: 'object', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
