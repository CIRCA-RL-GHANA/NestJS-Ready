import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Update ID' })
  @IsUUID()
  updateId: string;

  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Parent comment ID (for replies)', required: false })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}
