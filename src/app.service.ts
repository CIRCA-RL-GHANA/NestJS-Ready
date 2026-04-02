import { Injectable, Logger } from '@nestjs/common';

/**
 * Comprehensive service aggregator for backend modules
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor() {
    this.logger.log('Application initialized with 22 modules');
  }

  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    modules: string[];
  } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      modules: [
        'auth',
        'users',
        'entities',
        'profiles',
        'entity-profiles',
        'market-profiles',
        'qpoints',
        'products',
        'orders',
        'vehicles',
        'rides',
        'social',
        'ai',
        'health',
        'calendar',
        'planner',
        'statement',
        'wishlist',
        'subscriptions',
        'interests',
        'places',
        'favorite-drivers',
      ],
    };
  }

  /**
   * Get API routes documentation
   */
  getApiRoutes() {
    return {
      baseUrl: process.env.APP_URL || 'https://api.promptgenie.app',
      apiVersion: 'v1',
      endpoints: {
        auth: {
          login: 'POST /api/v1/auth/login',
          register: 'POST /api/v1/auth/register',
          refresh: 'POST /api/v1/auth/refresh',
          logout: 'POST /api/v1/auth/logout',
          me: 'GET /api/v1/auth/me',
        },
        users: {
          getById: 'GET /api/v1/users/:id',
          updateProfile: 'PATCH /api/v1/users/:id',
          verifyOTP: 'POST /api/v1/users/verify-otp',
          setPIN: 'POST /api/v1/users/set-pin',
          checkPhone: 'POST /api/v1/users/check-phone',
          checkUsername: 'GET /api/v1/users/check-username/:username',
        },
        chat: {
          getConversations: 'GET /api/v1/social/chat/sessions',
          getMessages: 'GET /api/v1/social/chat/:conversationId/messages',
          sendMessage: 'POST /api/v1/social/chat/messages',
          deleteMessage: 'DELETE /api/v1/social/chat/messages/:messageId',
        },
        files: {
          upload: 'POST /api/v1/files/upload',
          delete: 'DELETE /api/v1/files/:fileKey',
        },
        orders: {
          list: 'GET /api/v1/orders',
          getById: 'GET /api/v1/orders/:id',
          create: 'POST /api/v1/orders',
          cancel: 'PATCH /api/v1/orders/:id/cancel',
          track: 'GET /api/v1/orders/:id/track',
        },
        products: {
          list: 'GET /api/v1/products',
          getById: 'GET /api/v1/products/:id',
          create: 'POST /api/v1/products',
          update: 'PATCH /api/v1/products/:id',
        },
      },
      totalEndpoints: 190,
      documented: 'See /api/docs for interactive Swagger UI',
    };
  }

  /**
   * Get application statistics
   */
  getStats() {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      database: 'PostgreSQL 15',
      cache: 'Redis 7',
      queue: 'Bull',
      authentication: 'JWT + Passport',
      totalModules: 22,
      totalEndpoints: 190,
      rateLimit: '30 req/s (default), 5 req/s (auth)',
      cors: 'Enabled',
      compression: 'gzip (enabled)',
      security: ['Helmet', 'CORS protection', 'Rate limiting', 'JWT validation'],
    };
  }
}
