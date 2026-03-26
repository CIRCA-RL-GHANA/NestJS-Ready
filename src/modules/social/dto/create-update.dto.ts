import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateVisibility } from '../entities/update.entity';

export class CreateUpdateDto {
  @ApiProperty({ description: 'Update content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Visibility', enum: UpdateVisibility, required: false })
  @IsEnum(UpdateVisibility)
  @IsOptional()
  visibility?: UpdateVisibility;

  @ApiProperty({ description: 'Media attachments', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  media?: string[];

  @ApiProperty({ description: 'Tagged user IDs', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  taggedUsers?: string[];

  @ApiProperty({ description: 'Whether update is pinned', required: false })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}
