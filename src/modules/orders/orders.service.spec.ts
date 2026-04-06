import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FulfillmentSession } from './entities/fulfillment-session.entity';
import { ReturnRequest } from './entities/return-request.entity';
import { Delivery } from './entities/delivery.entity';
import { DeliveryPackage } from './entities/delivery-package.entity';
import { QPointAccount } from '../qpoints/entities/qpoint-account.entity';
import { ProductsService } from '../products/products.service';
import { QPointsTransactionService } from '../qpoints/qpoints-transaction.service';
import { AIFraudService } from '../ai/services/ai-fraud.service';
import { AINlpService } from '../ai/services/ai-nlp.service';
import { AISearchService } from '../ai/services/ai-search.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockRepo() },
        { provide: getRepositoryToken(OrderItem), useValue: mockRepo() },
        { provide: getRepositoryToken(FulfillmentSession), useValue: mockRepo() },
        { provide: getRepositoryToken(ReturnRequest), useValue: mockRepo() },
        { provide: getRepositoryToken(Delivery), useValue: mockRepo() },
        { provide: getRepositoryToken(DeliveryPackage), useValue: mockRepo() },
        { provide: getRepositoryToken(QPointAccount), useValue: mockRepo() },
        { provide: ProductsService, useValue: { getProductById: jest.fn() } },
        {
          provide: QPointsTransactionService,
          useValue: { deposit: jest.fn(), transfer: jest.fn() },
        },
        {
          provide: AIFraudService,
          useValue: {
            scoreTransaction: jest
              .fn()
              .mockReturnValue({ blocked: false, riskScore: 0, reviewFlag: false }),
          },
        },
        {
          provide: AINlpService,
          useValue: {
            extractKeywords: jest.fn().mockResolvedValue([]),
            analyzeSentiment: jest.fn(),
          },
        },
        { provide: AISearchService, useValue: { rankCandidates: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
