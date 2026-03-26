import { IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsArray } from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
}

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsArray()
  attachmentUrls?: string[];
}

export class CreateConversationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: 'direct' | 'group' = 'direct';
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  isArchived?: boolean;

  @IsOptional()
  isMuted?: boolean;
}

export class MarkMessageAsReadDto {
  @IsUUID()
  messageId: string;
}

export class DeleteMessageDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
