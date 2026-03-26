import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole } from '../entities/staff.entity';

export class AssignStaffRoleDto {
  @ApiProperty({
    description: 'Admin user ID (must be Administrator or Branch Manager)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  adminId: string;

  @ApiProperty({
    description: 'User ID of the staff member to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Role to assign',
    enum: StaffRole,
    example: StaffRole.SOCIAL_OFFICER,
  })
  @IsEnum(StaffRole)
  @IsNotEmpty()
  role: StaffRole;

  @ApiProperty({
    description: 'PIN for the staff member (6 digits)',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'PIN must be exactly 6 digits',
  })
  pin: string;

  @ApiPropertyOptional({
    description: 'Whether this is a branch assignment',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isBranch?: boolean;

  @ApiPropertyOptional({
    description: 'POS ID for Response Officers',
    example: 'POS-001',
  })
  @IsString()
  @IsOptional()
  posId?: string;

  @ApiPropertyOptional({
    description: 'Branch ID if assigning to a branch',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;
}
