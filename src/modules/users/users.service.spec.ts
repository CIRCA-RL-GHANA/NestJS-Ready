import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { Staff } from './entities/staff.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AIFraudService } from '../ai/services/ai-fraud.service';
import { AINlpService } from '../ai/services/ai-nlp.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo() },
        { provide: getRepositoryToken(Otp), useValue: mockRepo() },
        { provide: getRepositoryToken(Staff), useValue: mockRepo() },
        { provide: getRepositoryToken(AuditLog), useValue: mockRepo() },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-value') } },
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
            summariseText: jest
              .fn()
              .mockReturnValue({ summary: '', keywords: [], wordCount: 0, readingTimeSeconds: 0 }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
