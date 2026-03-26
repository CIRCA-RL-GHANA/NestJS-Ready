import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { WalletsService } from '../wallets/wallets.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockWalletsService = {
    deductBalance: jest.fn(),
    addBalance: jest.fn(),
    getBalance: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository,
        },
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const paymentDto = {
        orderId: 'order1',
        userId: 'user1',
        amount: 50.0,
        paymentMethod: 'CARD',
      };

      const mockPayment = { id: 'payment1', status: 'COMPLETED', ...paymentDto };
      mockRepository.save.mockResolvedValue(mockPayment);

      const result = await service.processPayment(paymentDto);

      expect(result.status).toBe('COMPLETED');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const mockPayment = { id: 'payment1', status: 'COMPLETED', amount: 50.0 };
      mockRepository.findOne.mockResolvedValue(mockPayment);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockWalletsService.addBalance.mockResolvedValue(true);

      await service.refundPayment('payment1');

      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockWalletsService.addBalance).toHaveBeenCalled();
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history for a user', async () => {
      const mockPayments = [
        { id: 'payment1', userId: 'user1', amount: 50.0, status: 'COMPLETED' },
        { id: 'payment2', userId: 'user1', amount: 30.0, status: 'COMPLETED' },
      ];

      mockRepository.find.mockResolvedValue(mockPayments);

      const result = await service.getPaymentHistory('user1');

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
