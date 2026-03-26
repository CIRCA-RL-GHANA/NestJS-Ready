import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QPointMarketNotification } from '../entities/q-point-market-notification.entity';

export interface NotificationPage {
  notifications: QPointMarketNotification[];
  total: number;
}

@Injectable()
export class MarketNotificationService {
  private readonly logger = new Logger(MarketNotificationService.name);

  /** Injected by the QPoints WebSocket gateway after module init */
  private wsServer: {
    emitToUser(userId: string, event: string, payload: unknown): void;
  } | null = null;

  constructor(
    @InjectRepository(QPointMarketNotification)
    private readonly repo: Repository<QPointMarketNotification>,
  ) {}

  /** Called by QPointsMarketGateway to wire up real-time delivery */
  setWsServer(server: {
    emitToUser(userId: string, event: string, payload: unknown): void;
  }): void {
    this.wsServer = server;
  }

  /**
   * Persist a notification and push it over WebSocket.
   */
  async notifyUser(
    userId: string,
    type: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<QPointMarketNotification> {
    const n = this.repo.create({ userId, type, message, data: data ?? null });
    await this.repo.save(n);

    this.wsServer?.emitToUser(userId, 'qpoints:notification', {
      id: n.id,
      type: n.type,
      message: n.message,
      data: n.data,
      createdAt: n.createdAt,
    });

    return n;
  }

  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    if (notificationIds.length === 0) return;
    await this.repo.update({ id: In(notificationIds), userId }, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, read: false }, { read: true });
  }

  async getUserNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<NotificationPage> {
    const [notifications, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }
}
