import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto';
import { CalendarEvent } from './entities/calendar-event.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Calendar')
@Controller('calendar')
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: CalendarEvent })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createEvent(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarService.createEvent(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all calendar events for the user' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [CalendarEvent] })
  async getEvents(@CurrentUser('id') userId: string): Promise<CalendarEvent[]> {
    return this.calendarService.getEvents(userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved', type: [CalendarEvent] })
  async getUpcomingEvents(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getUpcomingEvents(userId, days || 7);
  }

  @Get('recurring')
  @ApiOperation({ summary: 'Get all recurring events' })
  @ApiResponse({ status: 200, description: 'Recurring events retrieved', type: [CalendarEvent] })
  async getRecurringEvents(@CurrentUser('id') userId: string): Promise<CalendarEvent[]> {
    return this.calendarService.getRecurringEvents(userId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get events within a date range' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully', type: [CalendarEvent] })
  async getEventsByDateRange(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getEventsByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific calendar event' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully', type: CalendarEvent })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<CalendarEvent> {
    return this.calendarService.getEventById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a calendar event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: CalendarEvent })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async patchEvent(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarService.updateEvent(id, userId, updateDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a calendar event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: CalendarEvent })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarService.updateEvent(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a calendar event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.calendarService.deleteEvent(id, userId);
    return { message: 'Event deleted successfully' };
  }
}
