import { IsEnum, IsString, IsUUID, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/ai-event.entity';

export class CreateAIEventDto {
  @ApiProperty({ description: 'Event type', enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  eventName: string;

  @ApiProperty({ description: 'Entity type' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Event payload', type: 'object' })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({ description: 'Metadata', type: 'object', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
