import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FavoriteShop, AddedByRole } from './entities/favorite-shop.entity';
import { Interest, InterestAddedByRole, TargetType } from './entities/interest.entity';
import { ConnectionRequest, ConnectionStatus } from './entities/connection-request.entity';
import { AddFavoriteShopDto, RemoveFavoriteShopDto } from './dto/favorite-shop.dto';
import { AddInterestDto, RemoveInterestDto } from './dto/interest.dto';
import { CreateConnectionRequestDto, RespondConnectionRequestDto } from './dto/connection-request.dto';
import { AIRecommendationsService } from '../ai/services/ai-recommendations.service';

@Injectable()
export class InterestsService {
  private readonly logger = new Logger(InterestsService.name);

  constructor(
    @InjectRepository(FavoriteShop)
    private readonly favoriteShopRepository: Repository<FavoriteShop>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository(ConnectionRequest)
    private readonly connectionRequestRepository: Repository<ConnectionRequest>,
    private readonly dataSource: DataSource,
    private readonly aiRecommendations: AIRecommendationsService,
  ) {}

  /**
   * FAVORITE SHOPS
   */

  async addFavoriteShop(dto: AddFavoriteShopDto, userId: string, userRole: string): Promise<FavoriteShop> {
    this.logger.log(`Adding favorite shop: Entity ${dto.entityId}, Shop ${dto.shopId}`);

    // Check if already favorited
    const existing = await this.favoriteShopRepository.findOne({
      where: { entityId: dto.entityId, shopId: dto.shopId },
    });

    if (existing) {
      throw new ConflictException('Shop already favorited');
    }

    const favorite = this.favoriteShopRepository.create({
      ...dto,
      addedByRole: userRole === 'Owner' ? AddedByRole.OWNER : AddedByRole.ADMINISTRATOR,
      addedById: userId,
    });

    const saved = await this.favoriteShopRepository.save(favorite);
    this.logger.log(`Favorite shop added: ${saved.id}`);
    return saved;
  }

  async removeFavoriteShop(dto: RemoveFavoriteShopDto): Promise<void> {
    this.logger.log(`Removing favorite shop: Entity ${dto.entityId}, Shop ${dto.shopId}`);

    const favorite = await this.favoriteShopRepository.findOne({
      where: { entityId: dto.entityId, shopId: dto.shopId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite shop not found');
    }

    await this.favoriteShopRepository.softRemove(favorite);
    this.logger.log(`Favorite shop removed`);
  }

  async removeFavoriteShopById(id: string): Promise<void> {
    this.logger.log(`Removing favorite shop by ID: ${id}`);

    // Try by record ID first, then by shopId for frontend compatibility
    let favorite = await this.favoriteShopRepository.findOne({
      where: { id },
    });

    if (!favorite) {
      favorite = await this.favoriteShopRepository.findOne({
        where: { shopId: id },
      });
    }

    if (!favorite) {
      favorite = await this.favoriteShopRepository.findOne({
        where: { entityId: id },
      });
    }

    if (!favorite) {
      throw new NotFoundException('Favorite shop not found');
    }

    await this.favoriteShopRepository.softRemove(favorite);
    this.logger.log(`Favorite shop removed`);
  }

  async listFavoriteShops(entityId: string): Promise<FavoriteShop[]> {
    return await this.favoriteShopRepository.find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * INTERESTS
   */

  async addInterest(dto: AddInterestDto, userId: string, userRole: string): Promise<Interest> {
    this.logger.log(`Adding interest: Owner ${dto.ownerId}, Target ${dto.targetId} (${dto.targetType})`);

    // Check if interest already exists
    const existing = await this.interestRepository.findOne({
      where: {
        ownerId: dto.ownerId,
        targetId: dto.targetId,
        targetType: dto.targetType,
      },
    });

    if (existing) {
      throw new ConflictException('Interest already exists');
    }

    const interest = this.interestRepository.create({
      ...dto,
      addedByRole: this.mapRoleToInterestRole(userRole),
      interestLevel: dto.interestLevel || 5,
    });

    const saved = await this.interestRepository.save(interest);
    this.logger.log(`Interest added: ${saved.id}`);
    return saved;
  }

  async removeInterest(dto: RemoveInterestDto): Promise<void> {
    this.logger.log(`Removing interest: Owner ${dto.ownerId}, Target ${dto.targetId}`);

    const interest = await this.interestRepository.findOne({
      where: {
        ownerId: dto.ownerId,
        targetId: dto.targetId,
        targetType: dto.targetType,
      },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    await this.interestRepository.softRemove(interest);
    this.logger.log(`Interest removed`);
  }

  async removeInterestById(id: string): Promise<void> {
    this.logger.log(`Removing interest by ID: ${id}`);

    const interest = await this.interestRepository.findOne({
      where: { id },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    await this.interestRepository.softRemove(interest);
    this.logger.log(`Interest removed by ID`);
  }

  async listInterests(ownerId: string, targetType?: TargetType): Promise<Interest[]> {
    const where: any = { ownerId };
    if (targetType) {
      where.targetType = targetType;
    }

    return await this.interestRepository.find({
      where,
      order: { interestLevel: 'DESC', createdAt: 'DESC' },
    });
  }

  async getInterest(id: string): Promise<Interest> {
    const interest = await this.interestRepository.findOne({
      where: { id },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    return interest;
  }

  /**
   * CONNECTION REQUESTS
   */

  async createConnectionRequest(dto: CreateConnectionRequestDto): Promise<ConnectionRequest> {
    this.logger.log(`Creating connection request: ${dto.senderId} -> ${dto.receiverId}`);

    // Prevent self-connection
    if (dto.senderId === dto.receiverId) {
      throw new BadRequestException('Cannot send connection request to yourself');
    }

    // Check for existing connection request
    const existing = await this.connectionRequestRepository.findOne({
      where: [
        { senderId: dto.senderId, receiverId: dto.receiverId },
        { senderId: dto.receiverId, receiverId: dto.senderId },
      ],
    });

    if (existing) {
      throw new ConflictException('Connection request already exists');
    }

    const request = this.connectionRequestRepository.create(dto);
    const saved = await this.connectionRequestRepository.save(request);
    this.logger.log(`Connection request created: ${saved.id}`);
    return saved;
  }

  async respondToConnectionRequest(id: string, dto: RespondConnectionRequestDto): Promise<ConnectionRequest> {
    this.logger.log(`Responding to connection request: ${id}`);

    const request = await this.connectionRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    if (request.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException('Connection request already responded to');
    }

    request.status = dto.status;
    request.responseNotes = dto.responseNotes || null;
    request.respondedAt = new Date();

    // Increment connection score if approved
    if (dto.status === ConnectionStatus.APPROVED) {
      request.connectionScore = 10; // Initial score
    }

    const updated = await this.connectionRequestRepository.save(request);
    this.logger.log(`Connection request ${dto.status}: ${id}`);
    return updated;
  }

  async listSentConnectionRequests(senderId: string): Promise<ConnectionRequest[]> {
    return await this.connectionRequestRepository.find({
      where: { senderId },
      order: { createdAt: 'DESC' },
    });
  }

  async listReceivedConnectionRequests(receiverId: string, status?: ConnectionStatus): Promise<ConnectionRequest[]> {
    const where: any = { receiverId };
    if (status) {
      where.status = status;
    }

    return await this.connectionRequestRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getConnectionRequest(id: string): Promise<ConnectionRequest> {
    const request = await this.connectionRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    return request;
  }

  async cancelConnectionRequest(id: string, userId: string): Promise<void> {
    this.logger.log(`Cancelling connection request: ${id}`);

    const request = await this.connectionRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    // Only sender can cancel
    if (request.senderId !== userId) {
      throw new BadRequestException('Only the sender can cancel this request');
    }

    if (request.status !== ConnectionStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending requests');
    }

    await this.connectionRequestRepository.softRemove(request);
    this.logger.log(`Connection request cancelled: ${id}`);
  }

  async blockConnection(id: string, userId: string): Promise<ConnectionRequest> {
    this.logger.log(`Blocking connection: ${id}`);

    const request = await this.connectionRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    // Only receiver can block
    if (request.receiverId !== userId) {
      throw new BadRequestException('Only the receiver can block this request');
    }

    request.status = ConnectionStatus.BLOCKED;
    request.respondedAt = new Date();

    const updated = await this.connectionRequestRepository.save(request);
    this.logger.log(`Connection blocked: ${id}`);
    return updated;
  }

  /**
   * Get connections (approved connection requests)
   */
  async getConnections(userId: string): Promise<ConnectionRequest[]> {
    return await this.connectionRequestRepository.find({
      where: [
        { senderId: userId, status: ConnectionStatus.APPROVED },
        { receiverId: userId, status: ConnectionStatus.APPROVED },
      ],
      order: { connectionScore: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Helper methods
   */

  private mapRoleToInterestRole(role: string): InterestAddedByRole {
    const roleMap: Record<string, InterestAddedByRole> = {
      'Owner': InterestAddedByRole.OWNER,
      'Administrator': InterestAddedByRole.ADMINISTRATOR,
      'SocialOfficer': InterestAddedByRole.SOCIAL_OFFICER,
      'BranchManager': InterestAddedByRole.BRANCH_MANAGER,
    };

    return roleMap[role] || InterestAddedByRole.OWNER;
  }

  /**
   * AI RECOMMENDATIONS
   */

  async getAISimilarShops(entityId: string, topN = 5): Promise<{ shopId: string; score: number }[]> {
    const shops = await this.favoriteShopRepository.find({ where: { entityId } });
    if (shops.length < 2) return [];

    try {
      const docs = shops.map(s => ({
        id: s.shopId,
        text: [s.shopId, s.entityId, s.addedByRole].filter(Boolean).join(' '),
      }));
      const targetText = docs[0].text;
      const similar = await this.aiRecommendations.getSimilarItems(targetText, docs, topN);
      return similar.map((item: any) => ({ shopId: item.id, score: item.score }));
    } catch (err) {
      this.logger.warn(`getAISimilarShops failed: ${err.message}`);
      return [];
    }
  }

  async getAIInterestRecommendations(ownerId: string, targetType?: TargetType): Promise<Interest[]> {
    const interests = await this.listInterests(ownerId, targetType);
    if (interests.length < 2) return interests;

    try {
      const profileText = interests
        .map(i => [i.targetId, i.targetType, String(i.interestLevel)].join(' '))
        .join(' ');
      const corpus = interests.map(i => ({
        id: i.id,
        text: [i.targetId, i.targetType, String(i.interestLevel)].join(' '),
      }));
      const ranked = await this.aiRecommendations.getPersonalizedFeed(profileText, corpus);
      const rankMap = new Map<string, number>(ranked.map((r: any, idx: number) => [r.id, idx]));
      return [...interests].sort((a, b) => {
        const ra = rankMap.has(a.id) ? rankMap.get(a.id)! : interests.length;
        const rb = rankMap.has(b.id) ? rankMap.get(b.id)! : interests.length;
        return ra - rb;
      });
    } catch (err) {
      this.logger.warn(`getAIInterestRecommendations failed: ${err.message}`);
      return interests;
    }
  }
}
