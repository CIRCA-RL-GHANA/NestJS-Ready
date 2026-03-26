import { IsUUID, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHeyYaRequestDto {
  @ApiProperty({ description: 'Recipient ID' })
  @IsUUID()
  recipientId: string;

  @ApiProperty({ description: 'Request message', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Expiration date', required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
