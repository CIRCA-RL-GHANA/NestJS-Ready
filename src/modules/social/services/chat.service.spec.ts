import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { AINlpService } from '../../ai/services/ai-nlp.service';
import { HeyYaRequest } from '../entities/heyya-request.entity';

describe('ChatService', () => {
  let service: ChatService;
  let _messageRepo: Repository<ChatMessage>;
  let _sessionRepo: Repository<ChatSession>;

  const mockMessageRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockSessionRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockHeyYaRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn() };
  const mockAiNlp = {
    analyzeSentiment: jest.fn().mockResolvedValue({ label: 'neutral', score: 0 }),
    extractKeywords: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(ChatMessage), useValue: mockMessageRepo },
        { provide: getRepositoryToken(ChatSession), useValue: mockSessionRepo },
        { provide: getRepositoryToken(HeyYaRequest), useValue: mockHeyYaRepo },
        { provide: AINlpService, useValue: mockAiNlp },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    _messageRepo = module.get<Repository<ChatMessage>>(getRepositoryToken(ChatMessage));
    _sessionRepo = module.get<Repository<ChatSession>>(getRepositoryToken(ChatSession));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
