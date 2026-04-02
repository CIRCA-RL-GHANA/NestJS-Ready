import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Public display name', required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publicName?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false, example: 'https://cdn.promptgenie.app/profile.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePictureUrl?: string;

  @ApiProperty({ description: 'Bio/description', required: false, example: 'Software developer...' })
  @IsOptional()
  @IsString()
  bio?: string;
}
