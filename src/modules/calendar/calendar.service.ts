import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto';
import { EmailService } from '@/common/services/email.service';
import { AINlpService } from '../ai/services/ai-nlp.service';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEvent)
    private readonly calendarEventRepository: Repository<CalendarEvent>,
    private readonly emailService: EmailService,
    private readonly aiNlp: AINlpService,
  ) {}

  async createEvent(userId: string, createDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    try {
      const event = this.calendarEventRepository.create({
        userId,
        ...createDto,
      });

      // AI: extract keywords and intent from the event title/description
      const eventText = `${createDto.title ?? ''} ${(createDto as any).description ?? ''}`.trim();
      if (eventText.length > 4) {
        try {
          const keywords = this.aiNlp.extractKeywords(eventText, 5);
          const intent = this.aiNlp.detectIntent(eventText);
          (event as any).metadata = {
            ...((event as any).metadata ?? {}),
            ai: {
              keywords,
              intent: intent.intent,
              confidence: intent.confidence,
              entities: intent.entities,
            },
          };
        } catch (e) {
          this.logger.warn(`AI event enrichment failed: ${e.message}`);
        }
      }

      const savedEvent = await this.calendarEventRepository.save(event);
      this.logger.log(`Event created: ${savedEvent.title} for user ${userId}`);
      return savedEvent;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const events = await this.calendarEventRepository.find({
        where: { userId },
        order: { date: 'ASC' },
      });

      this.logger.log(`Retrieved ${events.length} events for user ${userId}`);
      return events;
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEventById(id: string, userId: string): Promise<CalendarEvent> {
    const event = await this.calendarEventRepository.findOne({
      where: { id, userId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async getEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEvent[]> {
    try {
      const events = await this.calendarEventRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
        },
        order: { date: 'ASC' },
      });

      this.logger.log(
        `Retrieved ${events.length} events for user ${userId} between ${startDate.toISOString()} and ${endDate.toISOString()}`,
      );
      return events;
    } catch (error) {
      this.logger.error(`Failed to fetch events by date range: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateEvent(
    id: string,
    userId: string,
    updateDto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    try {
      const event = await this.getEventById(id, userId);

      Object.assign(event, updateDto);
      const updatedEvent = await this.calendarEventRepository.save(event);

      this.logger.log(`Event ${id} updated for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Event Updated', `Event "${updatedEvent.title}" has been updated.`);

      return updatedEvent;
    } catch (error) {
      this.logger.error(`Failed to update event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    try {
      const event = await this.getEventById(id, userId);
      await this.calendarEventRepository.remove(event);

      this.logger.log(`Event ${id} deleted for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Event Deleted', `Event "${event.title}" has been removed from your calendar.`);
    } catch (error) {
      this.logger.error(`Failed to delete event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.getEventsByDateRange(userId, now, futureDate);
  }

  async getRecurringEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const events = await this.calendarEventRepository.find({
        where: { userId, recurring: true },
        order: { date: 'ASC' },
      });

      this.logger.log(`Retrieved ${events.length} recurring events for user ${userId}`);
      return events;
    } catch (error) {
      this.logger.error(`Failed to fetch recurring events: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AI-POWERED METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Smart event search: semantic re-ranking of all user events matching a query
   * using NLP keyword extraction and intent detection.
   */
  async searchEventsAI(userId: string, query: string): Promise<CalendarEvent[]> {
    const allEvents = await this.getEvents(userId);
    if (!allEvents.length || !query.trim()) return allEvents;

    const intent = this.aiNlp.detectIntent(query);
    const keywords = this.aiNlp.extractKeywords(query, 5);

    // Score each event by keyword overlap with the query
    const scored = allEvents.map((ev) => {
      const text =
        `${ev.title} ${(ev as any).description ?? ''} ${(ev as any).location ?? ''}`.toLowerCase();
      const hits = keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
      const intentBoost = intent.intent !== 'unknown' && text.includes(intent.intent) ? 0.2 : 0;
      return { event: ev, score: hits + intentBoost };
    });

    return scored.sort((a, b) => b.score - a.score).map((s) => s.event);
  }
}
