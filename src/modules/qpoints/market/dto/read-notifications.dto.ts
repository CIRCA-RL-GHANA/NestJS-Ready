import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadNotificationsDto {
  @ApiProperty({
    description: 'Array of notification IDs to mark as read (used when all=false)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds?: string[];

  @ApiProperty({ description: 'Set true to mark ALL notifications as read', required: false })
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
