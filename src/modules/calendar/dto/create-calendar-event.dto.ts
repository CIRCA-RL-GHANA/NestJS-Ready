import { IsString, IsNotEmpty, IsDate, IsBoolean, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecurrenceFrequency } from '../entities/calendar-event.entity';

export class CreateCalendarEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'Team Meeting',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Event date and time',
    example: '2024-01-15T10:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional({
    description: 'Event description',
    example: 'Quarterly planning meeting',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the event is recurring',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  recurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence frequency',
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.NONE,
  })
  @IsEnum(RecurrenceFrequency)
  @IsOptional()
  frequency?: RecurrenceFrequency;

  @ApiPropertyOptional({
    description: 'Event location',
    example: 'Conference Room A',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Event duration in minutes',
    example: 60,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Whether user should be reminded',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Reminder time in minutes before event',
    example: 30,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  reminderMinutes?: number;
}
