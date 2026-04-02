import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Entity ID', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: 'Public display name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  publicName: string;

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
