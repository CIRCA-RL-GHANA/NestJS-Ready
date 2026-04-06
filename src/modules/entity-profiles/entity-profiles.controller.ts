import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EntityProfilesService } from './entity-profiles.service';
import { CreateEntityProfileSettingsDto } from './dto/create-entity-profile-settings.dto';
import { UpdateEntityProfileSettingsDto } from './dto/update-entity-profile-settings.dto';
import { CreateOperatingHoursDto } from './dto/create-operating-hours.dto';
import { CreateBusinessCategoryDto } from './dto/create-business-category.dto';
import { EntityProfileSettings } from './entities/entity-profile-settings.entity';
import { OperatingHours, ProfileType } from './entities/operating-hours.entity';
import { BusinessCategory } from './entities/business-category.entity';

@ApiTags('Entity Profiles')
@Controller('entity-profiles')
@ApiBearerAuth()
export class EntityProfilesController {
  constructor(private readonly entityProfilesService: EntityProfilesService) {}

  // ==================== Profile Settings ====================

  @Post('settings')
  @ApiOperation({ summary: 'Create profile settings for Entity or Branch' })
  @ApiResponse({
    status: 201,
    description: 'Settings created successfully',
    type: EntityProfileSettings,
  })
  @ApiResponse({ status: 400, description: 'Settings already exist' })
  @HttpCode(HttpStatus.CREATED)
  async createProfileSettings(
    @Body() dto: CreateEntityProfileSettingsDto,
    @Req() req: any,
  ): Promise<EntityProfileSettings> {
    const userId = req.user?.id || 'system';
    return this.entityProfilesService.createProfileSettings(dto, userId);
  }

  @Get('settings/:profileType/:profileId')
  @ApiOperation({ summary: 'Get profile settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: EntityProfileSettings,
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async getProfileSettings(
    @Param('profileType') profileType: ProfileType,
    @Param('profileId') profileId: string,
  ): Promise<EntityProfileSettings> {
    return this.entityProfilesService.getProfileSettings(profileType, profileId);
  }

  @Put('settings/:id')
  @ApiOperation({ summary: 'Update profile settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: EntityProfileSettings,
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  async updateProfileSettings(
    @Param('id') id: string,
    @Body() dto: UpdateEntityProfileSettingsDto,
    @Req() req: any,
  ): Promise<EntityProfileSettings> {
    const userId = req.user?.id || 'system';
    return this.entityProfilesService.updateProfileSettings(id, dto, userId);
  }

  @Delete('settings/:id')
  @ApiOperation({ summary: 'Delete profile settings' })
  @ApiResponse({ status: 200, description: 'Settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  @HttpCode(HttpStatus.OK)
  async deleteProfileSettings(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.id || 'system';
    await this.entityProfilesService.deleteProfileSettings(id, userId);
    return { message: 'Profile settings deleted successfully' };
  }

  // ==================== Operating Hours ====================

  @Post('operating-hours')
  @ApiOperation({ summary: 'Create operating hours' })
  @ApiResponse({
    status: 201,
    description: 'Operating hours created successfully',
    type: OperatingHours,
  })
  @HttpCode(HttpStatus.CREATED)
  async createOperatingHours(
    @Body() dto: CreateOperatingHoursDto,
    @Req() req: any,
  ): Promise<OperatingHours> {
    const userId = req.user?.id || 'system';
    return this.entityProfilesService.createOperatingHours(dto, userId);
  }

  @Get('operating-hours/:profileType/:profileId')
  @ApiOperation({ summary: 'Get operating hours for profile' })
  @ApiResponse({
    status: 200,
    description: 'Operating hours retrieved successfully',
    type: [OperatingHours],
  })
  async getOperatingHours(
    @Param('profileType') profileType: ProfileType,
    @Param('profileId') profileId: string,
  ): Promise<OperatingHours[]> {
    return this.entityProfilesService.getOperatingHours(profileType, profileId);
  }

  @Put('operating-hours/:id')
  @ApiOperation({ summary: 'Update operating hours' })
  @ApiResponse({
    status: 200,
    description: 'Operating hours updated successfully',
    type: OperatingHours,
  })
  @ApiResponse({ status: 404, description: 'Operating hours not found' })
  async updateOperatingHours(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOperatingHoursDto>,
    @Req() req: any,
  ): Promise<OperatingHours> {
    const userId = req.user?.id || 'system';
    return this.entityProfilesService.updateOperatingHours(id, dto, userId);
  }

  @Delete('operating-hours/:id')
  @ApiOperation({ summary: 'Delete operating hours' })
  @ApiResponse({ status: 200, description: 'Operating hours deleted successfully' })
  @ApiResponse({ status: 404, description: 'Operating hours not found' })
  @HttpCode(HttpStatus.OK)
  async deleteOperatingHours(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.id || 'system';
    await this.entityProfilesService.deleteOperatingHours(id, userId);
    return { message: 'Operating hours deleted successfully' };
  }

  // ==================== Business Categories ====================

  @Post('categories')
  @ApiOperation({ summary: 'Create business category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: BusinessCategory,
  })
  @ApiResponse({ status: 400, description: 'Category already exists' })
  @HttpCode(HttpStatus.CREATED)
  async createBusinessCategory(
    @Body() dto: CreateBusinessCategoryDto,
    @Req() req: any,
  ): Promise<BusinessCategory> {
    const userId = req.user?.id || 'system';
    return this.entityProfilesService.createBusinessCategory(dto, userId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all active business categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [BusinessCategory],
  })
  async getAllBusinessCategories(): Promise<BusinessCategory[]> {
    return this.entityProfilesService.getAllBusinessCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get business category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: BusinessCategory,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getBusinessCategoryById(@Param('id') id: string): Promise<BusinessCategory> {
    return this.entityProfilesService.getBusinessCategoryById(id);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update business category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: BusinessCategory,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateBusinessCategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBusinessCategoryDto>,
    @Req() req: any,
  ): Promise<BusinessCategory> {
    const userId = req.user?.id || 'system';
    return this.entityProfilesService.updateBusinessCategory(id, dto, userId);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete business category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @HttpCode(HttpStatus.OK)
  async deleteBusinessCategory(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.id || 'system';
    await this.entityProfilesService.deleteBusinessCategory(id, userId);
    return { message: 'Business category deleted successfully' };
  }
}
