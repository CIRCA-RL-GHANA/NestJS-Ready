import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import { RideTracking } from './entities/ride-tracking.entity';
import { RideFeedback } from './entities/ride-feedback.entity';
import { RideReferral } from './entities/ride-referral.entity';
import { WaitTimeTracking } from './entities/wait-time-tracking.entity';
import { RideSOSAlert } from './entities/ride-sos-alert.entity';
import { QPointAccount } from '../qpoints/entities/qpoint-account.entity';
import { QPointsTransactionService } from '../qpoints/qpoints-transaction.service';
import { AIPricingService } from '../ai/services/ai-pricing.service';
import { AINlpService } from '../ai/services/ai-nlp.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('RidesService', () => {
  let service: RidesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RidesService,
        { provide: getRepositoryToken(Ride), useValue: mockRepo() },
        { provide: getRepositoryToken(RideTracking), useValue: mockRepo() },
        { provide: getRepositoryToken(RideFeedback), useValue: mockRepo() },
        { provide: getRepositoryToken(RideReferral), useValue: mockRepo() },
        { provide: getRepositoryToken(WaitTimeTracking), useValue: mockRepo() },
        { provide: getRepositoryToken(RideSOSAlert), useValue: mockRepo() },
        { provide: getRepositoryToken(QPointAccount), useValue: mockRepo() },
        {
          provide: QPointsTransactionService,
          useValue: { deposit: jest.fn(), transfer: jest.fn() },
        },
        {
          provide: AIPricingService,
          useValue: {
            computeRidePrice: jest
              .fn()
              .mockReturnValue({ basePrice: 10, finalPrice: 10, breakdown: {} }),
            computeSurgeMultiplier: jest.fn().mockReturnValue(1.0),
          },
        },
        { provide: AINlpService, useValue: { extractKeywords: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<RidesService>(RidesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
