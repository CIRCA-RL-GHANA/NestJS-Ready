import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MarketNotificationService } from '../services/market-notification.service';

/**
 * WebSocket gateway for real-time Q Points market events.
 * Clients authenticate with the same JWT used for HTTP.
 * Events emitted to clients:
 *   - qpoints:notification  { id, type, message, data, createdAt }
 *   - qpoints:orderbook     full order-book snapshot (broadcast)
 */
@WebSocketGateway({
  namespace: 'qpoints',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25_000,
  pingTimeout: 60_000,
})
export class QPointsMarketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(QPointsMarketGateway.name);

  /** userId → Set<socketId> */
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: MarketNotificationService,
  ) {}

  afterInit(): void {
    // Wire up the notification service so it can push real-time events
    this.notificationService.setWsServer({
      emitToUser: (userId: string, event: string, payload: unknown) => {
        this.emitToUser(userId, event, payload);
      },
    });
    this.logger.log('QPointsMarketGateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth as Record<string, string>)?.token ??
        (client.handshake.headers?.authorization ?? '').replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;
      (client as Socket & { userId: string }).userId = userId;
      client.join(`user:${userId}`);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`QPoints WS connected: ${userId} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = (client as Socket & { userId?: string }).userId;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
    }
    this.logger.log(`QPoints WS disconnected: ${client.id}`);
  }

  /** Emit an event to all sockets belonging to a user */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /** Broadcast order book update to all connected clients */
  broadcastOrderBook(book: unknown): void {
    this.server.emit('qpoints:orderbook', book);
  }
}
