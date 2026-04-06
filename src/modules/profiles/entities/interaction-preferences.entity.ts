import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { Profile } from './profile.entity';

export enum MessageRestriction {
  EVERYONE = 'Everyone',
  CONNECTIONS_ONLY = 'ConnectionsOnly',
  NO_ONE = 'NoOne',
}

export enum ProfileViewRestriction {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
  CONNECTIONS_ONLY = 'ConnectionsOnly',
}

@Entity('interaction_preferences')
@Index(['profileId'], { unique: true })
export class InteractionPreferences extends BaseEntity {
  @ApiProperty({ description: 'Profile ID', example: 'uuid' })
  @Column({ type: 'uuid', nullable: false, unique: true })
  profileId: string;

  @ApiProperty({
    description: 'Who can send messages',
    enum: MessageRestriction,
    example: MessageRestriction.EVERYONE,
  })
  @Column({
    type: 'enum',
    enum: MessageRestriction,
    default: MessageRestriction.EVERYONE,
  })
  messageRestriction: MessageRestriction;

  @ApiProperty({
    description: 'Who can view profile',
    enum: ProfileViewRestriction,
    example: ProfileViewRestriction.PUBLIC,
  })
  @Column({
    type: 'enum',
    enum: ProfileViewRestriction,
    default: ProfileViewRestriction.PUBLIC,
  })
  profileViewRestriction: ProfileViewRestriction;

  // Relations
  @ManyToOne(() => Profile, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;
}
