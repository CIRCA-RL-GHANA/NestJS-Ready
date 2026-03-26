import { IsUUID, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../entities/chat-message.entity';

export class SendMessageDto {
  @ApiProperty({ description: 'Chat session ID' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Message type', enum: MessageType, required: false })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @ApiProperty({ description: 'Message content', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Media URL', required: false })
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}
