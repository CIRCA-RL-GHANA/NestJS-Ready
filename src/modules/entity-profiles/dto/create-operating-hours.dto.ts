import { IsNotEmpty, IsEnum, IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileType, DayOfWeek } from '../entities/operating-hours.entity';

export class CreateOperatingHoursDto {
  @ApiProperty({
    description: 'Profile type (Entity or Branch)',
    enum: ProfileType,
    example: ProfileType.ENTITY,
  })
  @IsNotEmpty()
  @IsEnum(ProfileType)
  profileType: ProfileType;

  @ApiProperty({ description: 'Profile ID (Entity or Branch ID)', example: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  profileId: string;

  @ApiProperty({
    description: 'Day of week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Opening time', example: '09:00:00' })
  @IsNotEmpty()
  @IsString()
  openTime: string;

  @ApiProperty({ description: 'Closing time', example: '17:00:00' })
  @IsNotEmpty()
  @IsString()
  closeTime: string;

  @ApiProperty({ description: 'Whether closed on this day', required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}
