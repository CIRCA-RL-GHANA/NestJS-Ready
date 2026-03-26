import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteDriver, FavoriteDriverVisibility } from './entities/favorite-driver.entity';
import { AddFavoriteDriverDto } from './dto/add-favorite-driver.dto';
import { UpdateFavoriteDriverDto } from './dto/update-favorite-driver.dto';
import { AIRecommendationsService } from '../ai/services/ai-recommendations.service';

@Injectable()
export class FavoriteDriversService {
  constructor(
    @InjectRepository(FavoriteDriver)
    private favoriteDriverRepository: Repository<FavoriteDriver>,
    private readonly aiRecommendations: AIRecommendationsService,
  ) {}

  async addFavoriteDriver(addedById: string, dto: AddFavoriteDriverDto): Promise<FavoriteDriver> {
    // Check if driver is already favorited by this entity
    const existing = await this.favoriteDriverRepository.findOne({
      where: {
        entityId: dto.entityId,
        driverId: dto.driverId,
      },
    });

    if (existing) {
      throw new ConflictException('Driver is already in favorites');
    }

    const favorite = this.favoriteDriverRepository.create({
      ...dto,
      addedById,
      rideHistoryVerified: true, // Can be set based on AI verification
    });

    return await this.favoriteDriverRepository.save(favorite);
  }

  async removeFavoriteDriver(entityId: string, driverId: string): Promise<void> {
    const favorite = await this.favoriteDriverRepository.findOne({
      where: { entityId, driverId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite driver not found');
    }

    await this.favoriteDriverRepository.softDelete(favorite.id);
  }

  async getFavoriteDrivers(
    entityId: string,
    visibility?: FavoriteDriverVisibility,
  ): Promise<FavoriteDriver[]> {
    const query = this.favoriteDriverRepository.createQueryBuilder('favorite');
    query.where('favorite.entityId = :entityId', { entityId });

    if (visibility) {
      query.andWhere('favorite.visibility = :visibility', { visibility });
    }

    return await query.getMany();
  }

  async getFavoriteDriverById(id: string): Promise<FavoriteDriver> {
    const favorite = await this.favoriteDriverRepository.findOne({ where: { id } });

    if (!favorite) {
      throw new NotFoundException('Favorite driver not found');
    }

    return favorite;
  }

  async updateFavoriteDriver(
    entityId: string,
    driverId: string,
    updateDto: UpdateFavoriteDriverDto,
  ): Promise<FavoriteDriver> {
    const favorite = await this.favoriteDriverRepository.findOne({
      where: { entityId, driverId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite driver not found');
    }

    Object.assign(favorite, updateDto);
    return await this.favoriteDriverRepository.save(favorite);
  }

  async checkIsFavorite(entityId: string, driverId: string): Promise<boolean> {
    const favorite = await this.favoriteDriverRepository.findOne({
      where: { entityId, driverId },
    });

    return !!favorite;
  }

  async getFavoritesByDriver(driverId: string): Promise<FavoriteDriver[]> {
    return await this.favoriteDriverRepository.find({
      where: { driverId },
    });
  }

  async getPublicFavorites(entityId: string): Promise<FavoriteDriver[]> {
    return await this.favoriteDriverRepository.find({
      where: {
        entityId,
        visibility: FavoriteDriverVisibility.PUBLIC,
      },
    });
  }

  async updateVisibility(
    entityId: string,
    driverId: string,
    visibility: FavoriteDriverVisibility,
  ): Promise<FavoriteDriver> {
    const favorite = await this.favoriteDriverRepository.findOne({
      where: { entityId, driverId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite driver not found');
    }

    favorite.visibility = visibility;
    return await this.favoriteDriverRepository.save(favorite);
  }

  async updatePersonalRating(
    entityId: string,
    driverId: string,
    rating: number,
  ): Promise<FavoriteDriver> {
    if (rating < 0 || rating > 5) {
      throw new BadRequestException('Rating must be between 0 and 5');
    }

    const favorite = await this.favoriteDriverRepository.findOne({
      where: { entityId, driverId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite driver not found');
    }

    favorite.personalRating = rating;
    return await this.favoriteDriverRepository.save(favorite);
  }

  async getTopRatedFavorites(entityId: string, limit: number = 10): Promise<FavoriteDriver[]> {
    return await this.favoriteDriverRepository
      .createQueryBuilder('favorite')
      .where('favorite.entityId = :entityId', { entityId })
      .andWhere('favorite.personalRating IS NOT NULL')
      .orderBy('favorite.personalRating', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * AI: Re-rank an entity's favourite drivers by collaborative-filter score.
   * Returns driver IDs sorted by AI affinity, highest first.
   */
  async getAIRankedFavorites(
    entityId: string,
    topN = 10,
  ): Promise<{ driverId: string; score: number }[]> {
    try {
      const favorites = await this.getFavoriteDrivers(entityId);
      const corpus = favorites.map((f) => ({
        id: f.driverId,
        text: [
          (f as any).nickname ?? '',
          (f as any).notes ?? '',
          String(f.personalRating ?? ''),
        ]
          .filter(Boolean)
          .join(' '),
      }));
      const results = await this.aiRecommendations.getSimilarItems(entityId, corpus, topN);
      return results.map((r) => ({ driverId: r.id, score: r.score }));
    } catch {
      return [];
    }
  }
}
