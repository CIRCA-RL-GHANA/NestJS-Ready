import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPaymentsService = {
    createPayment: jest.fn(),
    processPayment: jest.fn(),
    refundPayment: jest.fn(),
  };

  const mockNotificationsService = {
    sendOrderConfirmation: jest.fn(),
    sendOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('create', () => {
    it('should create an order with valid data', async () => {
      const createOrderDto = {
        customerId: 'cust1',
        pickupAddress: '123 Main St',
        dropoffAddress: '456 Oak Ave',
        orderType: 'DELIVERY',
        baseFare: 10.0,
      };

      const mockOrder = { id: 'order1', ...createOrderDto };
      mockRepository.save.mockResolvedValue(mockOrder);
      mockNotificationsService.sendOrderConfirmation.mockResolvedValue(true);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        { id: 'order1', customerId: 'cust1', orderStatus: 'PENDING' },
        { id: 'order2', customerId: 'cust2', orderStatus: 'COMPLETED' },
      ];

      mockRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockNotificationsService.sendOrderStatus.mockResolvedValue(true);

      await service.updateStatus('order1', 'IN_TRANSIT');

      expect(mockRepository.update).toHaveBeenCalledWith(
        'order1',
        expect.objectContaining({ orderStatus: 'IN_TRANSIT' }),
      );
    });
  });

  describe('calculateFare', () => {
    it('should calculate fare based on distance and time', async () => {
      const fare = service.calculateFare(5.0, 15); // 5km, 15 minutes
      expect(fare).toBeGreaterThan(0);
      expect(typeof fare).toBe('number');
    });
  });
});
