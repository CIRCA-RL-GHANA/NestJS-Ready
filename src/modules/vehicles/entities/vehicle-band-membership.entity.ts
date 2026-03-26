import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('vehicle_band_memberships')
@Index(['vehicleId', 'bandId'], { unique: true })
@Index(['vehicleId'])
@Index(['bandId'])
export class VehicleBandMembership extends BaseEntity {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  vehicleId: string;

  @ApiProperty({
    description: 'Band ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  bandId: string;

  @ApiProperty({
    description: 'Date when vehicle was added to band',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: Date;
}
