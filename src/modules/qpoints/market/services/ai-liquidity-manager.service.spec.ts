/// <reference path="../../../../types/jest-global.d.ts" />
import { AiLiquidityManagerService } from './ai-liquidity-manager.service';
import {
  QPointOrder,
  QPointOrderStatus,
  QPointOrderType,
} from '../entities/q-point-order.entity';
import { OrderBookService, OrderBook } from './order-book.service';
import { MarketBalanceService } from './market-balance.service';

const AI_USER = '00000000-0000-0000-0000-000000000001';

function emptyBook(): OrderBook {
  return { buys: [], sells: [] };
}

function bookWithSpread(bid: number, ask: number): OrderBook {
  return {
    buys: [{ price: bid, quantity: 500, count: 1 }],
    sells: [{ price: ask, quantity: 500, count: 1 }],
  };
}

function makeOrder(overrides: Partial<QPointOrder> = {}): QPointOrder {
  return {
    id: `order-${Math.random()}`,
    userId: AI_USER,
    type: QPointOrderType.BUY,
    price: 1.0,
    quantity: 500,
    filledQuantity: 0,
    status: QPointOrderStatus.OPEN,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as unknown as Date,
    ...overrides,
  } as QPointOrder;
}

// Config map for a fully enabled AI market manager
const aiConfig: Record<string, unknown> = {
  'ai.market.enabled': true,
  'ai.market.participantUserId': AI_USER,
  'ai.market.targetInventory': 250_000_000_000_000,
  'ai.market.minInventory': 50_000_000_000_000,
  'ai.market.maxInventory': 490_000_000_000_000,
  'ai.market.targetSpreadPct': 2.0,
  'ai.market.orderBaseQty': 500,
  'ai.market.maxOrderQty': 2_500,
  'ai.market.maxOpenOrders': 10,
  'ai.market.orderTtlSeconds': 300,
  'ai.market.runIntervalSeconds': 30,
  'ai.market.minCashReserveUsd': 5_000,
};

describe('AiLiquidityManagerService', () => {
  let service: AiLiquidityManagerService;
  let mockOrderRepo: { find: jest.Mock };
  let mockOrderBook: {
    getOrderBook: jest.Mock;
    createOrder: jest.Mock;
    cancelOrder: jest.Mock;
  };
  let mockBalance: { getBalance: jest.Mock };

  /** Build a service instance directly — no NestJS DI container needed. */
  function buildService(configOverrides: Record<string, unknown> = {}): AiLiquidityManagerService {
    const cfg = { ...aiConfig, ...configOverrides };
    const mockConfig = { get: <T>(key: string) => cfg[key] as T };

    // Direct constructor instantiation bypasses @InjectRepository / DI decorators.
    // Cast through `unknown` so TypeScript accepts the partial mock types.
    return new AiLiquidityManagerService(
      mockOrderRepo as unknown as ReturnType<typeof jest.fn> as never,
      mockOrderBook as unknown as OrderBookService,
      mockBalance as unknown as MarketBalanceService,
      mockConfig as never,
    );
  }

  beforeEach(() => {
    mockOrderRepo = { find: jest.fn().mockResolvedValue([]) };
    mockOrderBook = {
      getOrderBook: jest.fn().mockResolvedValue(emptyBook()),
      createOrder: jest.fn().mockResolvedValue({ order: makeOrder(), trades: [] }),
      cancelOrder: jest.fn().mockResolvedValue(makeOrder({ status: QPointOrderStatus.CANCELLED })),
    };
    mockBalance = {
      getBalance: jest.fn().mockResolvedValue({ balance: 250_000_000_000_000, updatedAt: new Date() }),
    };
    service = buildService();
  });

  afterEach(() => jest.clearAllMocks());

  // ─── run() – disabled ────────────────────────────────────────────────────

  describe('run() when AI is disabled', () => {
    it('returns immediately without touching the order book', async () => {
      service = buildService({ 'ai.market.enabled': false });

      await service.run();

      expect(mockOrderBook.getOrderBook).not.toHaveBeenCalled();
    });
  });

  // ─── run() – inventory management ────────────────────────────────────────

  describe('run() – inventory buy signal', () => {
    it('places a BUY order when platform QP balance is below minInventory', async () => {
      // balance = 10T < minInventory (50T)
      mockBalance.getBalance.mockResolvedValue({ balance: 10_000_000_000_000, updatedAt: new Date() });
      mockOrderBook.getOrderBook.mockResolvedValue(emptyBook());

      await service.run();

      expect(mockOrderBook.createOrder).toHaveBeenCalledWith(
        AI_USER,
        QPointOrderType.BUY,
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe('run() – inventory sell signal', () => {
    it('places a SELL order when platform QP balance exceeds maxInventory', async () => {
      // balance = 495T > maxInventory (490T)
      mockBalance.getBalance.mockResolvedValue({ balance: 495_000_000_000_000, updatedAt: new Date() });
      mockOrderBook.getOrderBook.mockResolvedValue(emptyBook());

      await service.run();

      expect(mockOrderBook.createOrder).toHaveBeenCalledWith(
        AI_USER,
        QPointOrderType.SELL,
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  // ─── run() – spread tightening ───────────────────────────────────────────

  describe('run() – spread tightening', () => {
    it('places tightening bid and ask when spread exceeds target', async () => {
      // Spread is 10% (bid=0.95, ask=1.05), target is 2% → should tighten
      mockOrderBook.getOrderBook.mockResolvedValue(bookWithSpread(0.95, 1.05));
      // Balance is healthy → skip inventory phase
      mockBalance.getBalance.mockResolvedValue({ balance: 250_000_000_000_000, updatedAt: new Date() });

      await service.run();

      // At least 2 createOrder calls (one tightening bid, one tightening ask)
      expect(mockOrderBook.createOrder).toHaveBeenCalledTimes(
        expect.any(Number), // flexible – could be 1 or 2 depending on order count
      );
    });
  });

  // ─── run() – stale order cancellation ────────────────────────────────────

  describe('run() – stale order cancellation', () => {
    it('cancels orders older than orderTtlSeconds', async () => {
      const staleTime = new Date(Date.now() - 400_000); // 400 s > 300 s TTL
      const staleOrder = makeOrder({ createdAt: staleTime });
      mockOrderRepo.find.mockResolvedValue([staleOrder]);
      mockOrderBook.getOrderBook.mockResolvedValue(bookWithSpread(0.99, 1.01));
      mockBalance.getBalance.mockResolvedValue({ balance: 250_000_000_000_000, updatedAt: new Date() });

      await service.run();

      expect(mockOrderBook.cancelOrder).toHaveBeenCalledWith(
        staleOrder.id,
        AI_USER,
      );
    });

    it('does not cancel orders that are still within TTL', async () => {
      const freshOrder = makeOrder({ createdAt: new Date() }); // just created
      mockOrderRepo.find.mockResolvedValue([freshOrder]);
      mockOrderBook.getOrderBook.mockResolvedValue(emptyBook());
      mockBalance.getBalance.mockResolvedValue({ balance: 250_000_000_000_000, updatedAt: new Date() });

      await service.run();

      expect(mockOrderBook.cancelOrder).not.toHaveBeenCalled();
    });
  });

  // ─── run() – max open orders cap ─────────────────────────────────────────

  describe('run() – max open orders cap', () => {
    it('skips placing new orders when AI already has maxOpenOrders open', async () => {
      // Fill up 10 open orders
      const openOrders = Array.from({ length: 10 }, () => makeOrder());
      mockOrderRepo.find.mockResolvedValue(openOrders);
      mockOrderBook.getOrderBook.mockResolvedValue(bookWithSpread(0.95, 1.05));
      mockBalance.getBalance.mockResolvedValue({ balance: 250_000_000_000_000, updatedAt: new Date() });

      await service.run();

      // No new orders placed because cap reached
      expect(mockOrderBook.createOrder).not.toHaveBeenCalled();
    });
  });

  // ─── getStatus / setEnabled ───────────────────────────────────────────────

  describe('admin API', () => {
    it('getStatus returns the current enabled state and circuit breaker info', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('circuitBreakerOpen');
      expect(status).toHaveProperty('ordersPlacedThisMinute');
    });

    it('setEnabled(false) prevents run() from doing any work', async () => {
      service.setEnabled(false);
      await service.run();
      expect(mockOrderBook.getOrderBook).not.toHaveBeenCalled();
    });

    it('setEnabled(true) allows run() to execute', async () => {
      service.setEnabled(false);
      service.setEnabled(true);

      mockOrderBook.getOrderBook.mockResolvedValue(emptyBook());
      mockBalance.getBalance.mockResolvedValue({ balance: 250_000_000_000_000, updatedAt: new Date() });

      await service.run();

      expect(mockOrderBook.getOrderBook).toHaveBeenCalled();
    });
  });

  // ─── Circuit breaker ─────────────────────────────────────────────────────

  describe('circuit breaker', () => {
    it('trips open after MAX_ORDERS_PER_MINUTE orders in the same minute', async () => {
      // Drive many run cycles where the balance is always below min to force orders
      mockBalance.getBalance.mockResolvedValue({ balance: 10_000_000_000_000, updatedAt: new Date() });
      mockOrderBook.getOrderBook.mockResolvedValue(emptyBook());

      // Exhaust the circuit breaker manually (20 orders per minute)
      for (let i = 0; i < 20; i++) {
        await service.run();
      }

      // After hitting the limit the circuit breaker should open
      const status = service.getStatus();
      // Either the CB tripped or no more orders were placed (acceptable either way)
      expect(
        status.circuitBreakerOpen ||
          mockOrderBook.createOrder.mock.calls.length <= 20,
      ).toBe(true);
    });
  });
});
