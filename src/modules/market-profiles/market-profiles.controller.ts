import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { MarketProfilesService } from './market-profiles.service';
import { CreateMarketProfileDto } from './dto/create-market-profile.dto';
import { UpdateMarketProfileDto } from './dto/update-market-profile.dto';
import { MarketProfile, CreatedByType } from './entities/market-profile.entity';
import { MarketNotification, RecipientType } from './entities/market-notification.entity';

@ApiTags('Market Profiles')
@Controller('market-profiles')
export class MarketProfilesController {
  constructor(private readonly marketProfilesService: MarketProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new market profile' })
  @ApiResponse({ status: 201, description: 'Market profile created', type: MarketProfile })
  @ApiResponse({ status: 400, description: 'Invalid request or duplicate identifier' })
  async createMarketProfile(
    @Body() createDto: CreateMarketProfileDto,
    @Req() req: Request,
  ): Promise<MarketProfile> {
    const user = (req as any).user;
    const creatorType = user?.role === 'EntityAdmin' ? CreatedByType.ENTITY : CreatedByType.BRANCH;
    const creatorId = user?.id || 'system';

    return await this.marketProfilesService.createMarketProfile(createDto, creatorType, creatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all market profiles for a creator' })
  @ApiResponse({ status: 200, description: 'Market profiles retrieved', type: [MarketProfile] })
  async getMarketProfiles(@Req() req: Request): Promise<MarketProfile[]> {
    const user = (req as any).user;
    const creatorId = user?.id || 'system';
    const creatorType = user?.role === 'EntityAdmin' ? CreatedByType.ENTITY : CreatedByType.BRANCH;

    return await this.marketProfilesService.getMarketProfiles(creatorId, creatorType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single market profile' })
  @ApiResponse({ status: 200, description: 'Market profile retrieved', type: MarketProfile })
  @ApiResponse({ status: 404, description: 'Market profile not found' })
  async getMarketProfile(@Param('id') id: string): Promise<MarketProfile> {
    return await this.marketProfilesService.getMarketProfile(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a market profile' })
  @ApiResponse({ status: 200, description: 'Market profile updated', type: MarketProfile })
  @ApiResponse({ status: 403, description: 'Unauthorized modification' })
  @ApiResponse({ status: 404, description: 'Market profile not found' })
  async updateMarketProfile(
    @Param('id') id: string,
    @Body() updateDto: UpdateMarketProfileDto,
    @Req() req: Request,
  ): Promise<MarketProfile> {
    const userId = (req as any).user?.id || 'system';
    return await this.marketProfilesService.updateMarketProfile(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a market profile' })
  @ApiResponse({ status: 200, description: 'Market profile deleted' })
  @ApiResponse({ status: 403, description: 'Unauthorized deletion' })
  @ApiResponse({ status: 404, description: 'Market profile not found' })
  async deleteMarketProfile(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = (req as any).user?.id || 'system';
    await this.marketProfilesService.deleteMarketProfile(id, userId);
    return { message: 'Market profile deleted successfully' };
  }

  @Post(':id/ai-segmentation')
  @ApiOperation({ summary: 'Apply AI segmentation to a market profile' })
  @ApiResponse({ status: 200, description: 'AI segmentation applied', type: MarketProfile })
  @ApiResponse({ status: 404, description: 'Market profile not found' })
  async applyAiSegmentation(
    @Param('id') id: string,
    @Body()
    analytics: {
      clickRate: number;
      impressions: number;
      conversions: number;
      regionEngagement: Record<string, number>;
    },
  ): Promise<MarketProfile> {
    return await this.marketProfilesService.applyAiSegmentation(id, analytics);
  }

  @Get('notifications/my-notifications')
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved', type: [MarketNotification] })
  async getNotifications(@Req() req: Request): Promise<MarketNotification[]> {
    const user = (req as any).user;
    const recipientId = user?.id || 'system';
    const recipientType =
      user?.role === 'EntityAdmin' ? RecipientType.ENTITY : RecipientType.BRANCH;

    return await this.marketProfilesService.getNotifications(recipientId, recipientType);
  }

  @Put('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: MarketNotification,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markNotificationRead(@Param('id') id: string): Promise<MarketNotification> {
    return await this.marketProfilesService.markNotificationRead(id);
  }
}
