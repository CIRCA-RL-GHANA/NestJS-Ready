import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { Profile } from './profile.entity';

@Entity('visibility_settings')
@Index(['profileId'], { unique: true })
export class VisibilitySettings extends BaseEntity {
  @ApiProperty({ description: 'Profile ID', example: 'uuid' })
  @Column({ type: 'uuid', nullable: false, unique: true })
  profileId: string;

  @ApiProperty({ description: 'Whether profile is public', example: true })
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @ApiProperty({ description: 'Whether others can view this profile', example: true })
  @Column({ type: 'boolean', default: true })
  allowProfileView: boolean;

  @ApiProperty({ description: 'Whether others can send messages', example: true })
  @Column({ type: 'boolean', default: true })
  allowMessageReceive: boolean;

  // Relations
  @ManyToOne(() => Profile, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
}
