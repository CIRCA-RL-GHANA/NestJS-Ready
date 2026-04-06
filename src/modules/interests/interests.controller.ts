import { Controller, Get, Post, Delete, Body, Param, Query, Req, Put, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { InterestsService } from './interests.service';
import { AddFavoriteShopDto, RemoveFavoriteShopDto } from './dto/favorite-shop.dto';
import { AddInterestDto, RemoveInterestDto } from './dto/interest.dto';
import {
  CreateConnectionRequestDto,
  RespondConnectionRequestDto,
} from './dto/connection-request.dto';
import { FavoriteShop } from './entities/favorite-shop.entity';
import { Interest, TargetType } from './entities/interest.entity';
import { ConnectionRequest, ConnectionStatus } from './entities/connection-request.entity';

@ApiTags('Interests')
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  // FAVORITE SHOPS

  @Post('favorite-shops')
  @ApiOperation({ summary: 'Add a favorite shop' })
  @ApiResponse({ status: 201, description: 'Favorite shop added', type: FavoriteShop })
  @ApiResponse({ status: 409, description: 'Shop already favorited' })
  async addFavoriteShop(
    @Body() dto: AddFavoriteShopDto,
    @Req() req: Request,
  ): Promise<FavoriteShop> {
    const user = (req as any).user;
    const userId = user?.id || 'system';
    const userRole = user?.role || 'Owner';

    return await this.interestsService.addFavoriteShop(dto, userId, userRole);
  }

  @Delete('favorite-shops')
  @ApiOperation({ summary: 'Remove a favorite shop' })
  @ApiResponse({ status: 200, description: 'Favorite shop removed' })
  @ApiResponse({ status: 404, description: 'Favorite shop not found' })
  async removeFavoriteShop(@Body() dto: RemoveFavoriteShopDto): Promise<{ message: string }> {
    await this.interestsService.removeFavoriteShop(dto);
    return { message: 'Favorite shop removed successfully' };
  }

  @Delete('favorite-shops/:id')
  @ApiOperation({ summary: 'Remove a favorite shop by ID' })
  @ApiResponse({ status: 200, description: 'Favorite shop removed' })
  @ApiResponse({ status: 404, description: 'Favorite shop not found' })
  async removeFavoriteShopById(@Param('id') id: string): Promise<{ message: string }> {
    await this.interestsService.removeFavoriteShopById(id);
    return { message: 'Favorite shop removed successfully' };
  }

  @Get('favorite-shops')
  @ApiOperation({ summary: 'List all favorite shops for the current user' })
  @ApiResponse({ status: 200, description: 'Favorite shops retrieved', type: [FavoriteShop] })
  async listAllFavoriteShops(@Req() req: Request): Promise<FavoriteShop[]> {
    const userId = (req as any).user?.id;
    return await this.interestsService.listFavoriteShops(userId);
  }

  @Get('favorite-shops/:entityId')
  @ApiOperation({ summary: 'List favorite shops for an entity' })
  @ApiResponse({ status: 200, description: 'Favorite shops retrieved', type: [FavoriteShop] })
  async listFavoriteShops(@Param('entityId') entityId: string): Promise<FavoriteShop[]> {
    return await this.interestsService.listFavoriteShops(entityId);
  }

  // INTERESTS

  @Post('interests')
  @ApiOperation({ summary: 'Add an interest' })
  @ApiResponse({ status: 201, description: 'Interest added', type: Interest })
  @ApiResponse({ status: 409, description: 'Interest already exists' })
  async addInterest(@Body() dto: AddInterestDto, @Req() req: Request): Promise<Interest> {
    const user = (req as any).user;
    const userId = user?.id || 'system';
    const userRole = user?.role || 'Owner';

    return await this.interestsService.addInterest(dto, userId, userRole);
  }

  @Delete('interests')
  @ApiOperation({ summary: 'Remove an interest' })
  @ApiResponse({ status: 200, description: 'Interest removed' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async removeInterest(@Body() dto: RemoveInterestDto): Promise<{ message: string }> {
    await this.interestsService.removeInterest(dto);
    return { message: 'Interest removed successfully' };
  }

  @Delete('interests/:id')
  @ApiOperation({ summary: 'Remove an interest by ID' })
  @ApiResponse({ status: 200, description: 'Interest removed' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async removeInterestById(@Param('id') id: string): Promise<{ message: string }> {
    await this.interestsService.removeInterestById(id);
    return { message: 'Interest removed successfully' };
  }

  @Get('interests/:ownerId')
  @ApiOperation({ summary: 'List interests for an owner' })
  @ApiQuery({ name: 'targetType', enum: TargetType, required: false })
  @ApiResponse({ status: 200, description: 'Interests retrieved', type: [Interest] })
  async listInterests(
    @Param('ownerId') ownerId: string,
    @Query('targetType') targetType?: TargetType,
  ): Promise<Interest[]> {
    return await this.interestsService.listInterests(ownerId, targetType);
  }

  @Get('interests/detail/:id')
  @ApiOperation({ summary: 'Get a single interest' })
  @ApiResponse({ status: 200, description: 'Interest retrieved', type: Interest })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async getInterest(@Param('id') id: string): Promise<Interest> {
    return await this.interestsService.getInterest(id);
  }

  // CONNECTION REQUESTS

  @Post('connection-requests')
  @ApiOperation({ summary: 'Create a connection request' })
  @ApiResponse({ status: 201, description: 'Connection request created', type: ConnectionRequest })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 409, description: 'Connection request already exists' })
  async createConnectionRequest(
    @Body() dto: CreateConnectionRequestDto,
  ): Promise<ConnectionRequest> {
    return await this.interestsService.createConnectionRequest(dto);
  }

  @Patch('connection-requests/:id')
  @ApiOperation({ summary: 'Respond to a connection request (PATCH)' })
  @ApiResponse({ status: 200, description: 'Connection request updated', type: ConnectionRequest })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async patchRespondToConnectionRequest(
    @Param('id') id: string,
    @Body() dto: RespondConnectionRequestDto,
  ): Promise<ConnectionRequest> {
    return await this.interestsService.respondToConnectionRequest(id, dto);
  }

  @Put('connection-requests/:id/respond')
  @ApiOperation({ summary: 'Respond to a connection request' })
  @ApiResponse({ status: 200, description: 'Connection request updated', type: ConnectionRequest })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async respondToConnectionRequest(
    @Param('id') id: string,
    @Body() dto: RespondConnectionRequestDto,
  ): Promise<ConnectionRequest> {
    return await this.interestsService.respondToConnectionRequest(id, dto);
  }

  @Get('connection-requests/sent/:senderId')
  @ApiOperation({ summary: 'List sent connection requests' })
  @ApiResponse({
    status: 200,
    description: 'Connection requests retrieved',
    type: [ConnectionRequest],
  })
  async listSentConnectionRequests(
    @Param('senderId') senderId: string,
  ): Promise<ConnectionRequest[]> {
    return await this.interestsService.listSentConnectionRequests(senderId);
  }

  @Get('connection-requests/received/:receiverId')
  @ApiOperation({ summary: 'List received connection requests' })
  @ApiQuery({ name: 'status', enum: ConnectionStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Connection requests retrieved',
    type: [ConnectionRequest],
  })
  async listReceivedConnectionRequests(
    @Param('receiverId') receiverId: string,
    @Query('status') status?: ConnectionStatus,
  ): Promise<ConnectionRequest[]> {
    return await this.interestsService.listReceivedConnectionRequests(receiverId, status);
  }

  @Get('connection-requests/:id')
  @ApiOperation({ summary: 'Get a single connection request' })
  @ApiResponse({
    status: 200,
    description: 'Connection request retrieved',
    type: ConnectionRequest,
  })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async getConnectionRequest(@Param('id') id: string): Promise<ConnectionRequest> {
    return await this.interestsService.getConnectionRequest(id);
  }

  @Delete('connection-requests/:id')
  @ApiOperation({ summary: 'Cancel a connection request' })
  @ApiResponse({ status: 200, description: 'Connection request cancelled' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async cancelConnectionRequest(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = (req as any).user?.id || 'system';
    await this.interestsService.cancelConnectionRequest(id, userId);
    return { message: 'Connection request cancelled successfully' };
  }

  @Put('connection-requests/:id/block')
  @ApiOperation({ summary: 'Block a connection request' })
  @ApiResponse({ status: 200, description: 'Connection blocked', type: ConnectionRequest })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Connection request not found' })
  async blockConnection(@Param('id') id: string, @Req() req: Request): Promise<ConnectionRequest> {
    const userId = (req as any).user?.id || 'system';
    return await this.interestsService.blockConnection(id, userId);
  }

  @Get('connections/:userId')
  @ApiOperation({ summary: 'Get all approved connections for a user' })
  @ApiResponse({ status: 200, description: 'Connections retrieved', type: [ConnectionRequest] })
  async getConnections(@Param('userId') userId: string): Promise<ConnectionRequest[]> {
    return await this.interestsService.getConnections(userId);
  }

  // === Additional endpoints for frontend parity ===

  @Get('interests/categories')
  @ApiOperation({ summary: 'Get available interest target type categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getInterestCategories(): Promise<{ categories: string[] }> {
    return { categories: Object.values(TargetType) };
  }
}
