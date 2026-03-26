import { IsNotEmpty, IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Retail' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category description', required: false, example: 'Retail and wholesale businesses' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Parent category ID for hierarchical structure', required: false })
  @IsOptional()
  @IsUUID()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Whether category is active', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
