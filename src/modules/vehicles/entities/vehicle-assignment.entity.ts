import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum AssignmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
}

@Entity('vehicle_assignments')
@Index(['vehicleId'])
@Index(['driverId'])
@Index(['status'])
export class VehicleAssignment extends BaseEntity {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  vehicleId: string;

  @ApiProperty({
    description: 'Driver ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  driverId: string;

  @ApiProperty({
    description: 'Assignment status',
    enum: AssignmentStatus,
    example: AssignmentStatus.ACTIVE,
  })
  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  status: AssignmentStatus;

  @ApiProperty({
    description: 'Assignment start date',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @ApiProperty({
    description: 'Assignment end date',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @ApiProperty({
    description: 'Notes about the assignment',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
