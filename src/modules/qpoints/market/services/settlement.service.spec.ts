/// <reference path="../../../../types/jest-global.d.ts" />
import { SettlementService } from './settlement.service';
import {
  QPointSettlement,
  SettlementStatus,
  SettlementType,
} from '../entities/q-point-settlement.entity';
import { QPointTrade } from '../entities/q-point-trade.entity';
import { PaymentFacilitatorService } from './payment-facilitator.service';
import { MarketNotificationService } from './market-notification.service';

function makeTrade(overrides: Partial<QPointTrade> = {}): QPointTrade {
  return {
    id: 'trade-xyz',
    buyOrderId: 'order-buy',
    sellOrderId: 'order-sell',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    price: 1.05,
    quantity: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as unknown as Date,
    ...overrides,
  } as QPointTrade;
}

describe('SettlementService', () => {
  let service: SettlementService;
  let mockRepo: {
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    findOne: jest.Mock;
  };
  let mockFacilitator: { transfer: jest.Mock };
  let mockNotifications: { notifyUser: jest.Mock };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((dto) => ({ ...dto, id: `settlement-${Math.random()}` })),
      save: jest.fn(async (items: unknown) =>
        Array.isArray(items)
          ? items.map((item, i) => ({ ...item, id: `settlement-${i}` }))
          : items,
      ),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findOne: jest.fn(),
    };

    mockFacilitator = { transfer: jest.fn() };
    mockNotifications = { notifyUser: jest.fn().mockResolvedValue(undefined) };

    service = new SettlementService(
      mockRepo as never,
      mockFacilitator as unknown as PaymentFacilitatorService,
      mockNotifications as unknown as MarketNotificationService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  // ─── createSettlement ────────────────────────────────────────────────────

  describe('createSettlement', () => {
    it('creates two pending settlement records then marks both as completed on success', async () => {
      mockFacilitator.transfer.mockResolvedValue({
        transferId: 'ref-12345',
        status: 'completed',
      });

      const trade = makeTrade();
      await service.createSettlement(trade, 'buyer-1', 'seller-1', 105.0);

      // Two records created + saved
      expect(mockRepo.create).toHaveBeenCalledTimes(2);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: SettlementType.DEBIT, status: SettlementStatus.PENDING }),
          expect.objectContaining({ type: SettlementType.CREDIT, status: SettlementStatus.PENDING }),
        ]),
      );

      // Both updated to COMPLETED with facilitator reference
      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) }),
        expect.objectContaining({
          status: SettlementStatus.COMPLETED,
          facilitatorReference: 'ref-12345',
        }),
      );
    });

    it('uses the correct debit/credit types for buyer and seller', async () => {
      mockFacilitator.transfer.mockResolvedValue({
        transferId: 'ref-99',
        status: 'completed',
      });

      const trade = makeTrade();
      await service.createSettlement(trade, 'buyer-1', 'seller-1', 50.0);

      const createCalls = mockRepo.create.mock.calls;
      const types = createCalls.map((call) => call[0].type as SettlementType);
      expect(types).toContain(SettlementType.DEBIT);
      expect(types).toContain(SettlementType.CREDIT);
    });

    it('marks both records as FAILED when the facilitator returns failed status', async () => {
      mockFacilitator.transfer.mockResolvedValue({
        transferId: undefined,
        status: 'failed',
        errorMessage: 'Insufficient funds',
      });

      const trade = makeTrade();
      await expect(
        service.createSettlement(trade, 'buyer-1', 'seller-1', 105.0),
      ).rejects.toThrow();

      // Both records marked failed
      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(String) }),
        { status: SettlementStatus.FAILED },
      );
    });

    it('notifies both parties when settlement fails', async () => {
      mockFacilitator.transfer.mockRejectedValue(new Error('Network timeout'));

      const trade = makeTrade();
      await expect(
        service.createSettlement(trade, 'buyer-1', 'seller-1', 105.0),
      ).rejects.toThrow();

      expect(mockNotifications.notifyUser).toHaveBeenCalledWith(
        'buyer-1',
        'settlement_failed',
        expect.stringContaining(trade.id),
        expect.objectContaining({ tradeId: trade.id }),
      );
      expect(mockNotifications.notifyUser).toHaveBeenCalledWith(
        'seller-1',
        'settlement_failed',
        expect.stringContaining(trade.id),
        expect.objectContaining({ tradeId: trade.id }),
      );
    });

    it('calls the facilitator with the correct buyer, seller, amount and reference', async () => {
      mockFacilitator.transfer.mockResolvedValue({
        transferId: 'ref-ok',
        status: 'completed',
      });

      const trade = makeTrade({ id: 'trade-reference-check' });
      await service.createSettlement(trade, 'buyer-abc', 'seller-xyz', 200.0);

      expect(mockFacilitator.transfer).toHaveBeenCalledWith(
        'buyer-abc',
        'seller-xyz',
        200.0,
        'trade-reference-check',
      );
    });
  });

  // ─── getSettlementStatus ─────────────────────────────────────────────────

  describe('getSettlementStatus', () => {
    it('returns the settlement record when it exists', async () => {
      const s = {
        id: 'settlement-1',
        status: SettlementStatus.COMPLETED,
      } as QPointSettlement;
      mockRepo.findOne.mockResolvedValue(s);

      const result = await service.getSettlementStatus('settlement-1');

      expect(result).toBe(s);
    });

    it('throws InternalServerErrorException when the settlement is not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getSettlementStatus('nonexistent'),
      ).rejects.toThrow();
    });
  });
});
