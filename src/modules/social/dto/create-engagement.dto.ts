import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EngagementType, EngagementTarget } from '../entities/engagement.entity';

export class CreateEngagementDto {
  @ApiProperty({ description: 'Target type', enum: EngagementTarget })
  @IsEnum(EngagementTarget)
  targetType: EngagementTarget;

  @ApiProperty({ description: 'Target ID' })
  @IsUUID()
  targetId: string;

  @ApiProperty({ description: 'Engagement type', enum: EngagementType })
  @IsEnum(EngagementType)
  type: EngagementType;
}
