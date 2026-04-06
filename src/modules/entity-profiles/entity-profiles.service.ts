import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityProfileSettings } from './entities/entity-profile-settings.entity';
import { OperatingHours, ProfileType } from './entities/operating-hours.entity';
import { BusinessCategory } from './entities/business-category.entity';
import { AuditLog } from '@modules/users/entities/audit-log.entity';
import { CreateEntityProfileSettingsDto } from './dto/create-entity-profile-settings.dto';
import { UpdateEntityProfileSettingsDto } from './dto/update-entity-profile-settings.dto';
import { CreateOperatingHoursDto } from './dto/create-operating-hours.dto';
import { CreateBusinessCategoryDto } from './dto/create-business-category.dto';
import { AINlpService } from '../ai/services/ai-nlp.service';

@Injectable()
export class EntityProfilesService {
  private readonly logger = new Logger(EntityProfilesService.name);

  constructor(
    @InjectRepository(EntityProfileSettings)
    private readonly settingsRepository: Repository<EntityProfileSettings>,
    @InjectRepository(OperatingHours)
    private readonly operatingHoursRepository: Repository<OperatingHours>,
    @InjectRepository(BusinessCategory)
    private readonly categoryRepository: Repository<BusinessCategory>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly aiNlp: AINlpService,
  ) {}

  // ==================== Profile Settings ====================

  async createProfileSettings(
    dto: CreateEntityProfileSettingsDto,
    userId: string,
  ): Promise<EntityProfileSettings> {
    try {
      // Check if settings already exist
      const existing = await this.settingsRepository.findOne({
        where: {
          profileType: dto.profileType,
          profileId: dto.profileId,
        },
      });

      if (existing) {
        throw new BadRequestException('Profile settings already exist for this profile');
      }

      const settings = this.settingsRepository.create(dto);
      const saved = await this.settingsRepository.save(settings);

      await this.logAudit('Create Profile Settings', 'SUCCESS', userId, {
        profileType: dto.profileType,
        profileId: dto.profileId,
        settingsId: saved.id,
      });

      this.logger.log(`Profile settings created: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating profile settings: ${error.message}`, error.stack);
      await this.logAudit('Create Profile Settings', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  async getProfileSettings(
    profileType: ProfileType,
    profileId: string,
  ): Promise<EntityProfileSettings> {
    const settings = await this.settingsRepository.findOne({
      where: { profileType: profileType as any, profileId },
    });

    if (!settings) {
      throw new NotFoundException('Profile settings not found');
    }

    return settings;
  }

  async updateProfileSettings(
    id: string,
    dto: UpdateEntityProfileSettingsDto,
    userId: string,
  ): Promise<EntityProfileSettings> {
    try {
      const settings = await this.settingsRepository.findOne({ where: { id } });
      if (!settings) {
        throw new NotFoundException('Profile settings not found');
      }

      Object.assign(settings, dto);
      const updated = await this.settingsRepository.save(settings);

      await this.logAudit('Update Profile Settings', 'SUCCESS', userId, {
        settingsId: id,
        changes: dto,
      });

      this.logger.log(`Profile settings updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating profile settings: ${error.message}`, error.stack);
      await this.logAudit('Update Profile Settings', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  async deleteProfileSettings(id: string, userId: string): Promise<void> {
    try {
      const settings = await this.settingsRepository.findOne({ where: { id } });
      if (!settings) {
        throw new NotFoundException('Profile settings not found');
      }

      await this.settingsRepository.softDelete(id);

      await this.logAudit('Delete Profile Settings', 'SUCCESS', userId, { settingsId: id });
      this.logger.log(`Profile settings deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting profile settings: ${error.message}`, error.stack);
      await this.logAudit('Delete Profile Settings', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  // ==================== Operating Hours ====================

  async createOperatingHours(
    dto: CreateOperatingHoursDto,
    userId: string,
  ): Promise<OperatingHours> {
    try {
      const hours = this.operatingHoursRepository.create(dto);
      const saved = await this.operatingHoursRepository.save(hours);

      await this.logAudit('Create Operating Hours', 'SUCCESS', userId, {
        profileType: dto.profileType,
        profileId: dto.profileId,
        dayOfWeek: dto.dayOfWeek,
      });

      this.logger.log(`Operating hours created: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating operating hours: ${error.message}`, error.stack);
      await this.logAudit('Create Operating Hours', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  async getOperatingHours(profileType: ProfileType, profileId: string): Promise<OperatingHours[]> {
    return this.operatingHoursRepository.find({
      where: { profileType, profileId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async updateOperatingHours(
    id: string,
    dto: Partial<CreateOperatingHoursDto>,
    userId: string,
  ): Promise<OperatingHours> {
    try {
      const hours = await this.operatingHoursRepository.findOne({ where: { id } });
      if (!hours) {
        throw new NotFoundException('Operating hours not found');
      }

      Object.assign(hours, dto);
      const updated = await this.operatingHoursRepository.save(hours);

      await this.logAudit('Update Operating Hours', 'SUCCESS', userId, { hoursId: id });
      this.logger.log(`Operating hours updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating operating hours: ${error.message}`, error.stack);
      await this.logAudit('Update Operating Hours', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  async deleteOperatingHours(id: string, userId: string): Promise<void> {
    try {
      const hours = await this.operatingHoursRepository.findOne({ where: { id } });
      if (!hours) {
        throw new NotFoundException('Operating hours not found');
      }

      await this.operatingHoursRepository.softDelete(id);

      await this.logAudit('Delete Operating Hours', 'SUCCESS', userId, { hoursId: id });
      this.logger.log(`Operating hours deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting operating hours: ${error.message}`, error.stack);
      await this.logAudit('Delete Operating Hours', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  // ==================== Business Categories ====================

  async createBusinessCategory(
    dto: CreateBusinessCategoryDto,
    userId: string,
  ): Promise<BusinessCategory> {
    try {
      // Check uniqueness
      const existing = await this.categoryRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new BadRequestException('Category with this name already exists');
      }

      const category = this.categoryRepository.create(dto);
      const saved = await this.categoryRepository.save(category);

      await this.logAudit('Create Business Category', 'SUCCESS', userId, {
        categoryId: saved.id,
        name: dto.name,
      });
      this.logger.log(`Business category created: ${saved.id} (${dto.name})`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating business category: ${error.message}`, error.stack);
      await this.logAudit('Create Business Category', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  async getAllBusinessCategories(): Promise<BusinessCategory[]> {
    return this.categoryRepository.find({ where: { isActive: true } });
  }

  async getBusinessCategoryById(id: string): Promise<BusinessCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Business category not found');
    }
    return category;
  }

  async updateBusinessCategory(
    id: string,
    dto: Partial<CreateBusinessCategoryDto>,
    userId: string,
  ): Promise<BusinessCategory> {
    try {
      const category = await this.getBusinessCategoryById(id);
      Object.assign(category, dto);
      const updated = await this.categoryRepository.save(category);

      await this.logAudit('Update Business Category', 'SUCCESS', userId, { categoryId: id });
      this.logger.log(`Business category updated: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating business category: ${error.message}`, error.stack);
      await this.logAudit('Update Business Category', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  async deleteBusinessCategory(id: string, userId: string): Promise<void> {
    try {
      const category = await this.getBusinessCategoryById(id);
      await this.categoryRepository.softDelete(id);

      await this.logAudit('Delete Business Category', 'SUCCESS', userId, { categoryId: id });
      this.logger.log(`Business category deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting business category: ${error.message}`, error.stack);
      await this.logAudit('Delete Business Category', 'ERROR', userId, { error: error.message });
      throw error;
    }
  }

  // ==================== Private Helpers ====================

  private async logAudit(
    action: string,
    status: string,
    userId: string,
    metadata: any,
  ): Promise<void> {
    await this.auditLogRepository.save({
      action,
      status,
      userId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * AI: Classify and extract keywords from a business category name/description.
   */
  async getAICategoryInsights(
    categoryId: string,
  ): Promise<{ keywords: string[]; sentiment: string; summary: string }> {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const text = [(category as any).name ?? '', (category as any).description ?? '']
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
}
