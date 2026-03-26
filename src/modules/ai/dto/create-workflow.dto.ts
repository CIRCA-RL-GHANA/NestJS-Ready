import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  workflowName: string;

  @ApiProperty({ description: 'Workflow type' })
  @IsString()
  workflowType: string;

  @ApiProperty({ description: 'Workflow configuration', type: 'object' })
  @IsObject()
  config: Record<string, any>;
}
