import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus } from '../entities/vehicle-assignment.entity';

export class CreateVehicleAssignmentDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Driver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  driverId: string;

  @ApiProperty({
    description: 'Assignment status',
    enum: AssignmentStatus,
    required: false,
    default: AssignmentStatus.ACTIVE,
  })
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;

  @ApiProperty({
    description: 'Notes about the assignment',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
