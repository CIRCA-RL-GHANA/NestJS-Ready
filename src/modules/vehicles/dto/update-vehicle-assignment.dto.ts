import { PartialType } from '@nestjs/swagger';
import { CreateVehicleAssignmentDto } from './create-vehicle-assignment.dto';
import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVehicleAssignmentDto extends PartialType(CreateVehicleAssignmentDto) {
  @ApiProperty({
    description: 'Assignment end date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
