import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem, WishlistStatus, WishlistCategory } from './entities/wishlist-item.entity';
import { CreateWishlistItemDto, UpdateWishlistItemDto, MarkAsPurchasedDto } from './dto';
import { EmailService } from '@/common/services/email.service';
import { AIRecommendationsService } from '../ai/services/ai-recommendations.service';
import { AINlpService } from '../ai/services/ai-nlp.service';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    private readonly emailService: EmailService,
    private readonly aiRecommendations: AIRecommendationsService,
    private readonly aiNlp: AINlpService,
  ) {}

  async addItem(userId: string, createDto: CreateWishlistItemDto): Promise<WishlistItem> {
    try {
      const item = this.wishlistRepository.create({
        userId,
        ...createDto,
      });

      const savedItem = await this.wishlistRepository.save(item);
      this.logger.log(`Wishlist item added: ${savedItem.item} for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Item Added to Wishlist', `"${savedItem.item}" has been added to your wishlist.`);

      return savedItem;
    } catch (error) {
      this.logger.error(`Failed to add wishlist item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const items = await this.wishlistRepository.find({
        where: { userId },
        order: { priority: 'ASC', createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${items.length} wishlist items for user ${userId}`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to fetch wishlist: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getItemById(id: string, userId: string): Promise<WishlistItem> {
    const item = await this.wishlistRepository.findOne({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found`);
    }

    return item;
  }

  async getItemsByStatus(userId: string, status: WishlistStatus): Promise<WishlistItem[]> {
    try {
      const items = await this.wishlistRepository.find({
        where: { userId, status },
        order: { priority: 'ASC', createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${items.length} ${status} items for user ${userId}`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to fetch items by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getItemsByCategory(userId: string, category: WishlistCategory): Promise<WishlistItem[]> {
    try {
      const items = await this.wishlistRepository.find({
        where: { userId, category },
        order: { priority: 'ASC', createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${items.length} ${category} items for user ${userId}`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to fetch items by category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getHighPriorityItems(userId: string): Promise<WishlistItem[]> {
    try {
      const items = await this.wishlistRepository.find({
        where: { userId, status: WishlistStatus.PENDING },
        order: { priority: 'ASC', createdAt: 'DESC' },
        take: 10,
      });

      // Filter for priority 1-2
      const highPriorityItems = items.filter((item) => item.priority <= 2);

      this.logger.log(
        `Retrieved ${highPriorityItems.length} high priority items for user ${userId}`,
      );
      return highPriorityItems;
    } catch (error) {
      this.logger.error(`Failed to fetch high priority items: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateItem(
    id: string,
    userId: string,
    updateDto: UpdateWishlistItemDto,
  ): Promise<WishlistItem> {
    try {
      const item = await this.getItemById(id, userId);

      Object.assign(item, updateDto);
      const updatedItem = await this.wishlistRepository.save(item);

      this.logger.log(`Wishlist item ${id} updated for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Wishlist Updated', `"${updatedItem.item}" has been updated.`);

      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to update wishlist item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsPurchased(
    id: string,
    userId: string,
    markDto: MarkAsPurchasedDto,
  ): Promise<WishlistItem> {
    try {
      const item = await this.getItemById(id, userId);

      item.status = WishlistStatus.PURCHASED;
      item.purchasedAt = markDto.purchasedAt || new Date();
      if (markDto.actualPrice !== undefined) {
        item.actualPrice = markDto.actualPrice;
      }

      const updatedItem = await this.wishlistRepository.save(item);

      this.logger.log(`Wishlist item ${id} marked as purchased for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Item Purchased', `Congratulations! "${updatedItem.item}" marked as purchased.`);

      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to mark item as purchased: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStatus(id: string, userId: string, status: WishlistStatus): Promise<WishlistItem> {
    try {
      const item = await this.getItemById(id, userId);

      item.status = status;
      const updatedItem = await this.wishlistRepository.save(item);

      this.logger.log(`Wishlist item ${id} status changed to ${status} for user ${userId}`);

      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to update item status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteItem(id: string, userId: string): Promise<void> {
    try {
      const item = await this.getItemById(id, userId);
      await this.wishlistRepository.remove(item);

      this.logger.log(`Wishlist item ${id} deleted for user ${userId}`);

      // Send notification
      // await this.emailService.sendNotification(userEmail, 'Item Removed', `"${item.item}" has been removed from your wishlist.`);
    } catch (error) {
      this.logger.error(`Failed to delete wishlist item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTotalEstimatedValue(userId: string): Promise<number> {
    try {
      const items = await this.wishlistRepository.find({
        where: { userId, status: WishlistStatus.PENDING },
      });

      const total = items.reduce((sum, item) => {
        return sum + (item.estimatedPrice ? Number(item.estimatedPrice) : 0);
      }, 0);

      this.logger.log(`Total estimated wishlist value calculated for user ${userId}: $${total}`);
      return total;
    } catch (error) {
      this.logger.error(`Failed to calculate total estimated value: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AI-POWERED WISHLIST INTELLIGENCE
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Score all pending wishlist items by conversion likelihood.
   * Returns items sorted from most-likely-to-buy first.
   */
  async getAIConversionScores(userId: string) {
    const items = await this.wishlistRepository.find({
      where: { userId, status: WishlistStatus.PENDING },
    });

    if (!items.length) return [];

    const input = items.map((item) => ({
      id: item.id,
      name: item.item,
      priority: item.priority ?? 3,
      addedDaysAgo: Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86_400_000),
      estimatedPrice: Number(item.estimatedPrice ?? 0),
      budget: Number(item.estimatedPrice ?? 0) || undefined,
    }));

    return this.aiRecommendations.scoreWishlistConversion(input);
  }

  /**
   * Find wishlist items most semantically similar to a given product name/description.
   * Useful for "you may also want" cross-selling.
   */
  async getAISimilarWishlistItems(userId: string, productText: string, topN = 5) {
    const items = await this.wishlistRepository.find({
      where: { userId, status: WishlistStatus.PENDING },
    });

    return this.aiRecommendations.getSimilarItems(
      productText,
      items.map((i) => ({ id: i.id, tags: i.item + ' ' + (i.notes ?? '') })),
      topN,
    );
  }

  /**
   * Suggest keywords for smart notifications (price-drop alerts, back-in-stock).
   */
  async getAIKeywordsForItem(itemId: string, userId: string) {
    const item = await this.getItemById(itemId, userId);
    const keywords = this.aiNlp.extractKeywords(item.item + ' ' + (item.notes ?? ''), 8);
    return { itemId: item.id, keywords };
  }
}
