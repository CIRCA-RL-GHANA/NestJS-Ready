import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageRestriction, ProfileViewRestriction } from '../entities/interaction-preferences.entity';

export class UpdateInteractionPreferencesDto {
  @ApiProperty({ 
    description: 'Who can send messages', 
    enum: MessageRestriction,
    required: false,
    example: MessageRestriction.EVERYONE 
  })
  @IsOptional()
  @IsEnum(MessageRestriction)
  messageRestriction?: MessageRestriction;

  @ApiProperty({ 
    description: 'Who can view profile', 
    enum: ProfileViewRestriction,
    required: false,
    example: ProfileViewRestriction.PUBLIC 
  })
  @IsOptional()
  @IsEnum(ProfileViewRestriction)
  profileViewRestriction?: ProfileViewRestriction;
}
