import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

@Entity('statements')
@Index(['userId'], { unique: true })
export class Statement extends BaseEntity {
  @ApiProperty({
    description: 'User ID who owns this statement',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @ApiProperty({
    description: 'Lifestyle description',
    example: 'Active, health-conscious, enjoys outdoor activities',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  lifestyle: string | null;

  @ApiProperty({
    description: 'Family details and background',
    example: 'Married with two children, parents live nearby',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  familyDetails: string | null;

  @ApiProperty({
    description: 'Marital status',
    enum: MaritalStatus,
    required: false,
  })
  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus: MaritalStatus | null;

  @ApiProperty({
    description: 'Number of children',
    example: 2,
    required: false,
  })
  @Column({ type: 'integer', nullable: true })
  numberOfChildren: number | null;

  @ApiProperty({
    description: 'Occupation',
    example: 'Software Engineer',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  occupation: string | null;

  @ApiProperty({
    description: 'Hobbies and interests',
    example: 'Reading, hiking, photography',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  hobbies: string | null;

  @ApiProperty({
    description: 'Health information',
    example: 'No major health concerns, exercises regularly',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  healthInfo: string | null;

  @ApiProperty({
    description: 'Education background',
    example: "Bachelor's in Computer Science",
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  education: string | null;

  @ApiProperty({
    description: 'Personal goals',
    example: 'Save for retirement, travel more, learn new skills',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  personalGoals: string | null;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
