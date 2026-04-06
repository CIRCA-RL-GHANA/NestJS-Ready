import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto, UpdateWishlistItemDto, MarkAsPurchasedDto } from './dto';
import { WishlistItem, WishlistStatus, WishlistCategory } from './entities/wishlist-item.entity';

@ApiTags('Wishlist')
@Controller('wishlist')
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiResponse({ status: 201, description: 'Item added successfully', type: WishlistItem })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async addItem(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateWishlistItemDto,
  ): Promise<WishlistItem> {
    return this.wishlistService.addItem(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wishlist items' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully', type: [WishlistItem] })
  async getWishlist(@CurrentUser('id') userId: string): Promise<WishlistItem[]> {
    return this.wishlistService.getWishlist(userId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get items by status' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully', type: [WishlistItem] })
  async getItemsByStatus(
    @CurrentUser('id') userId: string,
    @Param('status') status: WishlistStatus,
  ): Promise<WishlistItem[]> {
    return this.wishlistService.getItemsByStatus(userId, status);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get items by category' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully', type: [WishlistItem] })
  async getItemsByCategory(
    @CurrentUser('id') userId: string,
    @Param('category') category: WishlistCategory,
  ): Promise<WishlistItem[]> {
    return this.wishlistService.getItemsByCategory(userId, category);
  }

  @Get('high-priority')
  @ApiOperation({ summary: 'Get high priority items' })
  @ApiResponse({ status: 200, description: 'High priority items retrieved', type: [WishlistItem] })
  async getHighPriorityItems(@CurrentUser('id') userId: string): Promise<WishlistItem[]> {
    return this.wishlistService.getHighPriorityItems(userId);
  }

  @Get('total-value')
  @ApiOperation({ summary: 'Get total estimated value of pending items' })
  @ApiResponse({ status: 200, description: 'Total value calculated' })
  async getTotalEstimatedValue(@CurrentUser('id') userId: string): Promise<{ total: number }> {
    const total = await this.wishlistService.getTotalEstimatedValue(userId);
    return { total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific wishlist item' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getItemById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<WishlistItem> {
    return this.wishlistService.getItemById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a wishlist item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async patchItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateWishlistItemDto,
  ): Promise<WishlistItem> {
    return this.wishlistService.updateItem(id, userId, updateDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a wishlist item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async updateItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateWishlistItemDto,
  ): Promise<WishlistItem> {
    return this.wishlistService.updateItem(id, userId, updateDto);
  }

  @Patch(':id/purchase')
  @ApiOperation({ summary: 'Mark item as purchased (PATCH)' })
  @ApiResponse({ status: 200, description: 'Item marked as purchased', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async patchMarkAsPurchased(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() markDto: MarkAsPurchasedDto,
  ): Promise<WishlistItem> {
    return this.wishlistService.markAsPurchased(id, userId, markDto);
  }

  @Put(':id/purchase')
  @ApiOperation({ summary: 'Mark item as purchased' })
  @ApiResponse({ status: 200, description: 'Item marked as purchased', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async markAsPurchased(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() markDto: MarkAsPurchasedDto,
  ): Promise<WishlistItem> {
    return this.wishlistService.markAsPurchased(id, userId, markDto);
  }

  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update item status (PATCH)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async patchStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('status') status: WishlistStatus,
  ): Promise<WishlistItem> {
    return this.wishlistService.updateStatus(id, userId, status);
  }

  @Put(':id/status/:status')
  @ApiOperation({ summary: 'Update item status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: WishlistItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('status') status: WishlistStatus,
  ): Promise<WishlistItem> {
    return this.wishlistService.updateStatus(id, userId, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a wishlist item' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async deleteItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.wishlistService.deleteItem(id, userId);
    return { message: 'Wishlist item deleted successfully' };
  }
}
