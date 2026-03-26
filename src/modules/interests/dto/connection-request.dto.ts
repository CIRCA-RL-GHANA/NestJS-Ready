import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ConnectionStatus } from '../entities/connection-request.entity';

export class CreateConnectionRequestDto {
  @ApiProperty({
    description: 'Sender (requester) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  senderId: string;

  @ApiProperty({
    description: 'Receiver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  receiverId: string;

  @ApiProperty({
    description: 'Message included with the request',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class RespondConnectionRequestDto {
  @ApiProperty({
    description: 'Response status',
    enum: [ConnectionStatus.APPROVED, ConnectionStatus.DECLINED],
    example: ConnectionStatus.APPROVED,
  })
  @IsEnum([ConnectionStatus.APPROVED, ConnectionStatus.DECLINED])
  status: ConnectionStatus;

  @ApiProperty({
    description: 'Response notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  responseNotes?: string;
}
