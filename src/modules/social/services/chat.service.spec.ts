import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepository: Repository<Message>;
  let conversationRepository: Repository<Conversation>;

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  const mockConversationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    conversationRepository = module.get<Repository<Conversation>>(
      getRepositoryToken(Conversation),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      const dto = {
        content: 'Hello',
        type: 'text',
      };

      const conversation = {
        id: 'conv-1',
        name: 'Test Conversation',
        updatedAt: new Date(),
      };

      const createdMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
        type: 'text',
        read: false,
        createdAt: new Date(),
      };

      mockConversationRepository.findOne.mockResolvedValue(conversation);
      mockMessageRepository.create.mockReturnValue(createdMessage);
      mockMessageRepository.save.mockResolvedValue(createdMessage);

      const result = await service.createMessage('conv-1', dto, 'user-1');

      expect(result).toEqual(createdMessage);
      expect(mockConversationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
      });
      expect(mockMessageRepository.create).toHaveBeenCalled();
      expect(mockMessageRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createMessage('conv-1', { content: 'Hello', type: 'text' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMessages', () => {
    it('should return messages for a conversation', async () => {
      const messages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          content: 'Hello',
          createdAt: new Date(),
        },
      ];

      mockMessageRepository.findAndCount.mockResolvedValue([messages, 1]);

      const result = await service.getMessages('conv-1', { limit: 10, offset: 0 });

      expect(result.data).toEqual(messages);
      expect(result.total).toBe(1);
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark a message as read', async () => {
      const message = {
        id: 'msg-1',
        read: false,
      };

      const updatedMessage = { ...message, read: true };

      mockMessageRepository.findOne.mockResolvedValue(message);
      mockMessageRepository.save.mockResolvedValue(updatedMessage);

      const result = await service.markMessageAsRead('msg-1');

      expect(result.read).toBe(true);
      expect(mockMessageRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const message = {
        id: 'msg-1',
        senderId: 'user-1',
      };

      mockMessageRepository.findOne.mockResolvedValue(message);
      mockMessageRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteMessage('msg-1', 'user-1');

      expect(mockMessageRepository.delete).toHaveBeenCalledWith({ id: 'msg-1' });
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const dto = {
        participantIds: ['user-1', 'user-2'],
        name: 'Test Chat',
      };

      const createdConversation = {
        id: 'conv-1',
        ...dto,
        createdAt: new Date(),
      };

      mockConversationRepository.create.mockReturnValue(createdConversation);
      mockConversationRepository.save.mockResolvedValue(createdConversation);

      const result = await service.createConversation(dto);

      expect(result).toEqual(createdConversation);
      expect(mockConversationRepository.create).toHaveBeenCalled();
      expect(mockConversationRepository.save).toHaveBeenCalled();
    });
  });
});
