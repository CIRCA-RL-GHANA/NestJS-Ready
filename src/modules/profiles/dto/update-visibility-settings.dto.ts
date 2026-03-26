import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVisibilitySettingsDto {
  @ApiProperty({ description: 'Whether profile is public', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Whether others can view this profile', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  allowProfileView?: boolean;

  @ApiProperty({ description: 'Whether others can send messages', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  allowMessageReceive?: boolean;
}
