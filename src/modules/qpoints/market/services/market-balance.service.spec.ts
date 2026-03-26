/// <reference path="../../../../types/jest-global.d.ts" />
import { MarketBalanceService } from './market-balance.service';
import { QPointMarketBalance } from '../entities/q-point-market-balance.entity';

const USER_ID = 'user-abc-123';
const AI_USER_ID = '00000000-0000-0000-0000-000000000001';

function buildManagerMock(overrides: Record<string, unknown> = {}) {
  const qb = {
    setLock: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orIgnore: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
    createQueryBuilder: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };
  const repo = {
    createQueryBuilder: jest.fn(() => qb),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  return {
    qb,
    manager: {
      createQueryBuilder: jest.fn(() => qb),
      getRepository: jest.fn(() => repo),
      save: jest.fn(),
      ...overrides,
    },
    repoInManager: repo,
  };
}

describe('MarketBalanceService', () => {
  let service: MarketBalanceService;
  let mockDataSource: { transaction: jest.Mock };
  let mockRepo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(),
    };

    service = new MarketBalanceService(
      mockRepo as never,
      mockDataSource as never,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // getBalance
  // =========================================================================
  describe('getBalance', () => {
    it('returns 0 when no row exists for the user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getBalance(USER_ID);

      expect(result.balance).toBe(0);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('returns the stored balance when a row exists', async () => {
      const now = new Date();
      mockRepo.findOne.mockResolvedValue({
        userId: USER_ID,
        balance: '1234.5678',
        updatedAt: now,
      });

      const result = await service.getBalance(USER_ID);

      expect(result.balance).toBeCloseTo(1234.5678);
      expect(result.updatedAt).toBe(now);
    });

    it('resolves with 0 for an unknown AI participant before first seeding', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.getBalance(AI_USER_ID);
      expect(result.balance).toBe(0);
    });
  });

  // =========================================================================
  // adjustBalance
  // =========================================================================
  describe('adjustBalance', () => {
    it('credits balance on positive delta', async () => {
      const { manager, repoInManager, qb } = buildManagerMock();
      const row = { userId: USER_ID, balance: '1000', updatedAt: new Date() };
      qb.getOne.mockResolvedValue(row);
      repoInManager.save.mockResolvedValue({ ...row, balance: 1100 });
      mockDataSource.transaction.mockImplementation(async (fn: (m: typeof manager) => Promise<number>) => fn(manager));

      const newBalance = await service.adjustBalance(USER_ID, 100, 'test_credit');

      expect(newBalance).toBe(1100);
      expect(repoInManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 1100 }),
      );
    });

    it('debits balance on negative delta', async () => {
      const { manager, repoInManager, qb } = buildManagerMock();
      const row = { userId: USER_ID, balance: '1000', updatedAt: new Date() };
      qb.getOne.mockResolvedValue(row);
      repoInManager.save.mockResolvedValue({ ...row, balance: 750 });
      mockDataSource.transaction.mockImplementation(async (fn: (m: typeof manager) => Promise<number>) => fn(manager));

      const newBalance = await service.adjustBalance(USER_ID, -250, 'trade_sell_xyz');

      expect(newBalance).toBe(750);
    });

    it('throws BadRequestException when debit would go below zero', async () => {
      const { manager, repoInManager: _r, qb } = buildManagerMock();
      qb.getOne.mockResolvedValue({
        userId: USER_ID,
        balance: '50',
        updatedAt: new Date(),
      });
      mockDataSource.transaction.mockImplementation(async (fn: (m: typeof manager) => Promise<number>) => fn(manager));

      await expect(
        service.adjustBalance(USER_ID, -200, 'trade_sell_overspend'),
      ).rejects.toThrow();
    });

    it('throws NotFoundException when balance row disappears mid-transaction', async () => {
      const { manager, qb } = buildManagerMock();
      qb.getOne.mockResolvedValue(null); // Row not found after upsert
      mockDataSource.transaction.mockImplementation(async (fn: (m: typeof manager) => Promise<number>) => fn(manager));

      await expect(
        service.adjustBalance(USER_ID, 10, 'mystery_credit'),
      ).rejects.toThrow();
    });
  });
});
