import { Entity, Column, ManyToOne, JoinColumn, OneToOne, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { EntityProfile } from '@modules/entities/entities/entity.entity';

@Entity('profiles')
@Index(['userId'], { unique: true })
@Index(['entityId'], { unique: true })
export class Profile extends BaseEntity {
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  @Column({ type: 'uuid', nullable: false, unique: true })
  userId: string;

  @ApiProperty({ description: 'Entity ID', example: 'uuid' })
  @Column({ type: 'uuid', nullable: false, unique: true })
  entityId: string;

  @ApiProperty({ description: 'Public display name', example: 'John Doe' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  publicName: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'https://cdn.promptgenie.app/profile.jpg', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePictureUrl: string;

  @ApiProperty({ description: 'Bio/description', example: 'Software developer passionate about...', required: false })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ description: 'Whether MFA is verified', example: true })
  @Column({ type: 'boolean', default: false })
  mfaVerified: boolean;

  // Relations
  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => EntityProfile, { eager: false, nullable: false })
  @JoinColumn({ name: 'entityId' })
  entity: EntityProfile;
}
