import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { EntityProfile } from '@modules/entities/entities/entity.entity';
import { Branch } from '@modules/entities/entities/branch.entity';

export enum ProfileType {
  ENTITY = 'Entity',
  BRANCH = 'Branch',
}

export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

@Entity('operating_hours')
@Index(['profileType', 'profileId'])
export class OperatingHours extends BaseEntity {
  @ApiProperty({
    description: 'Profile type (Entity or Branch)',
    enum: ProfileType,
    example: ProfileType.ENTITY,
  })
  @Column({ type: 'enum', enum: ProfileType })
  profileType: ProfileType;

  @ApiProperty({ description: 'Profile ID (Entity or Branch ID)', example: 'uuid' })
  @Column({ type: 'uuid' })
  profileId: string;

  @ApiProperty({
    description: 'Day of week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Opening time', example: '09:00:00' })
  @Column({ type: 'time' })
  openTime: string;

  @ApiProperty({ description: 'Closing time', example: '17:00:00' })
  @Column({ type: 'time' })
  closeTime: string;

  @ApiProperty({ description: 'Whether closed on this day', example: false })
  @Column({ type: 'boolean', default: false })
  isClosed: boolean;
}
