import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('vehicle_pricing')
@Index(['vehicleId', 'branchId'], { unique: true })
@Index(['vehicleId'])
@Index(['branchId'])
export class VehiclePricing extends BaseEntity {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  vehicleId: string;

  @ApiProperty({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  branchId: string;

  @ApiProperty({
    description: 'Allowable wait time in minutes before charges apply',
    example: 5,
  })
  @Column({ type: 'int' })
  allowableWaitTime: number;

  @ApiProperty({
    description: 'Price per minute after allowable wait time',
    example: 2.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerMinute: number;
}
