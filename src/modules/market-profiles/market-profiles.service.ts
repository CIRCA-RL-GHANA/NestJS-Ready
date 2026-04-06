import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateMarketProfileDto } from './dto/create-market-profile.dto';
import { UpdateMarketProfileDto } from './dto/update-market-profile.dto';
import { MarketProfile, CreatedByType, ProfileVisibility } from './entities/market-profile.entity';
import {
  MarketNotification,
  NotificationType,
  RecipientType,
} from './entities/market-notification.entity';
import { AINlpService } from '../ai/services/ai-nlp.service';
import { AIRecommendationsService } from '../ai/services/ai-recommendations.service';

interface SegmentationResult {
  segments: string[];
  visibility: string;
}

interface EngagementAnalytics {
  clickRate: number;
  impressions: number;
  conversions: number;
  regionEngagement: Record<string, number>;
}

@Injectable()
export class MarketProfilesService {
  private readonly logger = new Logger(MarketProfilesService.name);

  constructor(
    @InjectRepository(MarketProfile)
    private readonly marketProfileRepository: Repository<MarketProfile>,
    @InjectRepository(MarketNotification)
    private readonly notificationRepository: Repository<MarketNotification>,
    private readonly dataSource: DataSource,
    private readonly aiNlp: AINlpService,
    private readonly aiRecommendations: AIRecommendationsService,
  ) {}

  /**
   * Create a new market profile
   */
  async createMarketProfile(
    dto: CreateMarketProfileDto,
    creatorType: CreatedByType,
    creatorId: string,
  ): Promise<MarketProfile> {
    this.logger.log(`Creating market profile: ${dto.uniqueMarketIdentifier}`);

    // Check for duplicate identifier
    const existing = await this.marketProfileRepository.findOne({
      where: { uniqueMarketIdentifier: dto.uniqueMarketIdentifier },
    });

    if (existing) {
      throw new BadRequestException('Market identifier already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create market profile
      const profile = this.marketProfileRepository.create({
        ...dto,
        createdByType: creatorType,
        createdById: creatorId,
        visibility: dto.visibility || ProfileVisibility.PRIVATE,
      });

      const savedProfile = await queryRunner.manager.save(profile);

      // Create success notification
      await this.createNotification(
        creatorType === CreatedByType.ENTITY ? RecipientType.ENTITY : RecipientType.BRANCH,
        creatorId,
        `Market Profile ${dto.uniqueMarketIdentifier} created successfully.`,
        NotificationType.SUCCESS,
        savedProfile.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Market profile created: ${savedProfile.id}`);
      return savedProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create market profile:', error);

      // Create error notification
      await this.createNotification(
        creatorType === CreatedByType.ENTITY ? RecipientType.ENTITY : RecipientType.BRANCH,
        creatorId,
        `Failed to create Market Profile: ${error.message}`,
        NotificationType.ERROR,
        null,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all market profiles for a creator
   */
  async getMarketProfiles(
    creatorId: string,
    creatorType?: CreatedByType,
  ): Promise<MarketProfile[]> {
    const where: any = { createdById: creatorId };
    if (creatorType) {
      where.createdByType = creatorType;
    }

    return await this.marketProfileRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single market profile
   */
  async getMarketProfile(id: string): Promise<MarketProfile> {
    const profile = await this.marketProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Market profile not found');
    }

    return profile;
  }

  /**
   * Update a market profile
   */
  async updateMarketProfile(
    id: string,
    dto: UpdateMarketProfileDto,
    userId: string,
  ): Promise<MarketProfile> {
    this.logger.log(`Updating market profile: ${id}`);

    const profile = await this.marketProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Market profile not found');
    }

    // Authorization check
    if (profile.createdById !== userId) {
      throw new ForbiddenException('Unauthorized modification');
    }

    // Fraud detection for suspicious fields
    const suspiciousFields = ['visibility', 'advertisementExposureRules'];
    const flagged = suspiciousFields.some((field) => dto.hasOwnProperty(field));

    if (flagged) {
      this.logger.warn(`Suspicious modification detected on profile ${id}`);
      await this.detectFraud(profile, userId, dto);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update profile
      Object.assign(profile, dto);
      const updatedProfile = await queryRunner.manager.save(profile);

      // Create notification
      await this.createNotification(
        profile.createdByType === CreatedByType.ENTITY
          ? RecipientType.ENTITY
          : RecipientType.BRANCH,
        profile.createdById,
        `Market Profile ${profile.uniqueMarketIdentifier} updated.`,
        NotificationType.SUCCESS,
        profile.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Market profile updated: ${id}`);
      return updatedProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to update market profile:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete a market profile
   */
  async deleteMarketProfile(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting market profile: ${id}`);

    const profile = await this.marketProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Market profile not found');
    }

    // Authorization check
    if (profile.createdById !== userId) {
      throw new ForbiddenException('Unauthorized deletion');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Soft delete profile
      await queryRunner.manager.softRemove(profile);

      // Create notification
      await this.createNotification(
        profile.createdByType === CreatedByType.ENTITY
          ? RecipientType.ENTITY
          : RecipientType.BRANCH,
        profile.createdById,
        `Market Profile ${profile.uniqueMarketIdentifier} deleted.`,
        NotificationType.SUCCESS,
        profile.id,
        queryRunner,
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Market profile deleted: ${id}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to delete market profile:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Apply AI segmentation refinement
   */
  async applyAiSegmentation(id: string, analytics: EngagementAnalytics): Promise<MarketProfile> {
    this.logger.log(`Applying AI segmentation to profile: ${id}`);

    const profile = await this.marketProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Market profile not found');
    }

    // AI segmentation logic
    const refinedSegments: string[] = [];

    // High click rate = engaged audience
    if (analytics.clickRate > 0.5) {
      refinedSegments.push('Highly Engaged');
      if (!profile.advertisementExposureRules) {
        profile.advertisementExposureRules = {};
      }
      profile.advertisementExposureRules.priority = 'High';
    }

    // Low region engagement = adjust visibility
    const region = profile.demographicMetrics?.region;
    if (region && analytics.regionEngagement[region] < 0.2) {
      profile.visibility = ProfileVisibility.PRIVATE;
      refinedSegments.push('Low Regional Engagement');
    }

    // High conversions = valuable segment
    if (analytics.conversions > 100) {
      refinedSegments.push('High Conversion Rate');
    }

    // Update profile with AI insights
    profile.refinedSegments = refinedSegments;
    profile.engagementAnalytics = analytics;
    profile.lastAiRefinement = new Date();

    const updated = await this.marketProfileRepository.save(profile);
    this.logger.log(`AI segmentation applied to profile: ${id}`);
    return updated;
  }

  /**
   * Apply segmentation rules
   */
  applySegmentationRules(
    profile: MarketProfile,
    userEngagementData: {
      interests: string[];
      location: string;
    },
  ): SegmentationResult {
    const refinedSegments: string[] = [];

    // Interest matching
    const profileInterests = profile.demographicMetrics?.interests || [];
    const matchingInterests = userEngagementData.interests.filter((interest) =>
      profileInterests.includes(interest),
    );

    if (matchingInterests.length > 0) {
      refinedSegments.push('Interest Match');
    }

    // Location matching
    if (userEngagementData.location === profile.demographicMetrics?.region) {
      refinedSegments.push('Local Audience');
    }

    // Visibility enforcement
    const visibility = profile.visibility === ProfileVisibility.PUBLIC ? 'Visible' : 'Restricted';

    return {
      segments: refinedSegments,
      visibility,
    };
  }

  /**
   * Detect fraudulent modifications
   */
  private async detectFraud(
    profile: MarketProfile,
    userId: string,
    changes: UpdateMarketProfileDto,
  ): Promise<void> {
    this.logger.warn(`Fraud detected on profile ${profile.id} by user ${userId}`);

    // Flag the profile
    profile.fraudFlag = true;

    // Create notification
    await this.createNotification(
      profile.createdByType === CreatedByType.ENTITY ? RecipientType.ENTITY : RecipientType.BRANCH,
      profile.createdById,
      `Suspicious modification detected on Market Profile ${profile.uniqueMarketIdentifier}.`,
      NotificationType.ERROR,
      profile.id,
    );
  }

  /**
   * Create a notification
   */
  private async createNotification(
    recipientType: RecipientType,
    recipientId: string,
    message: string,
    type: NotificationType,
    marketProfileId: string | null,
    queryRunner?: any,
  ): Promise<void> {
    const notification = this.notificationRepository.create({
      recipientType,
      recipientId,
      message,
      type,
      marketProfileId,
    });

    if (queryRunner) {
      await queryRunner.manager.save(notification);
    } else {
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    recipientId: string,
    recipientType?: RecipientType,
  ): Promise<MarketNotification[]> {
    const where: any = { recipientId };
    if (recipientType) {
      where.recipientType = recipientType;
    }

    return await this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<MarketNotification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    return await this.notificationRepository.save(notification);
  }

  /**
   * AI: Extract keywords + sentiment from a market profile description.
   */
  async getAIProfileInsights(
    profileId: string,
  ): Promise<{ keywords: string[]; sentiment: string; summary: string }> {
    const profile = await this.getMarketProfile(profileId);
    const text = [
      (profile as any).businessName ?? '',
      (profile as any).description ?? '',
      (profile as any).tagline ?? '',
    ]
      .filter(Boolean)
      .join(' ');
    if (!text.trim()) return { keywords: [], sentiment: 'neutral', summary: '' };
    try {
      const [kw, sent, sum] = await Promise.all([
        this.aiNlp.extractKeywords(text),
        this.aiNlp.analyzeSentiment(text),
        this.aiNlp.summariseText(text),
      ]);
      return { keywords: kw, sentiment: sent.label, summary: sum.summary };
    } catch {
      return { keywords: [], sentiment: 'neutral', summary: '' };
    }
  }

  /**
   * AI: Recommend similar market profiles to a given profile.
   */
  async getAISimilarProfiles(
    profileId: string,
    topN = 5,
  ): Promise<{ profileId: string; score: number }[]> {
    try {
      const allProfiles = await this.marketProfileRepository.find({ take: 200 });
      const corpus = allProfiles.map((p) => ({
        id: p.id,
        tags: [
          (p as any).businessName ?? '',
          (p as any).description ?? '',
          (p as any).category ?? '',
        ]
          .filter(Boolean)
          .join(' '),
      }));
      const results = await this.aiRecommendations.getSimilarItems(profileId, corpus, topN);
      return results.map((r) => ({ profileId: r.id, score: r.score }));
    } catch {
      return [];
    }
  }
}
