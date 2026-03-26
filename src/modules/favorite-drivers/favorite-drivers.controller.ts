import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FavoriteDriversService } from './favorite-drivers.service';
import { AddFavoriteDriverDto } from './dto/add-favorite-driver.dto';
import { UpdateFavoriteDriverDto } from './dto/update-favorite-driver.dto';
import { RemoveFavoriteDriverDto } from './dto/remove-favorite-driver.dto';
import { FavoriteDriverVisibility } from './entities/favorite-driver.entity';

@ApiTags('Favorite Drivers')
@Controller('favorite-drivers')
export class FavoriteDriversController {
  constructor(private readonly favoriteDriversService: FavoriteDriversService) {}

  @Post()
  @ApiOperation({ summary: 'Add driver to favorites' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Driver added to favorites' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Driver already in favorites' })
  addFavoriteDriver(
    @Body() dto: AddFavoriteDriverDto,
    @Query('addedById') addedById: string,
  ) {
    return this.favoriteDriversService.addFavoriteDriver(addedById, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove driver from favorites' })
  removeFavoriteDriver(@Body() dto: RemoveFavoriteDriverDto) {
    return this.favoriteDriversService.removeFavoriteDriver(dto.entityId, dto.driverId);
  }

  @Get('entity/:entityId')
  @ApiOperation({ summary: 'Get all favorite drivers for an entity' })
  @ApiQuery({ name: 'visibility', required: false, enum: FavoriteDriverVisibility })
  getFavoriteDrivers(
    @Param('entityId') entityId: string,
    @Query('visibility') visibility?: FavoriteDriverVisibility,
  ) {
    return this.favoriteDriversService.getFavoriteDrivers(entityId, visibility);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get favorite driver by ID' })
  getFavoriteDriverById(@Param('id') id: string) {
    return this.favoriteDriversService.getFavoriteDriverById(id);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update favorite driver details' })
  updateFavoriteDriver(
    @Query('entityId') entityId: string,
    @Query('driverId') driverId: string,
    @Body() updateDto: UpdateFavoriteDriverDto,
  ) {
    return this.favoriteDriversService.updateFavoriteDriver(entityId, driverId, updateDto);
  }

  @Get('check/:entityId/:driverId')
  @ApiOperation({ summary: 'Check if driver is favorited by entity' })
  checkIsFavorite(
    @Param('entityId') entityId: string,
    @Param('driverId') driverId: string,
  ) {
    return this.favoriteDriversService.checkIsFavorite(entityId, driverId);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get all favorites for a specific driver' })
  getFavoritesByDriver(@Param('driverId') driverId: string) {
    return this.favoriteDriversService.getFavoritesByDriver(driverId);
  }

  @Get('entity/:entityId/public')
  @ApiOperation({ summary: 'Get public favorites for an entity' })
  getPublicFavorites(@Param('entityId') entityId: string) {
    return this.favoriteDriversService.getPublicFavorites(entityId);
  }

  @Put('visibility')
  @ApiOperation({ summary: 'Update favorite driver visibility' })
  updateVisibility(
    @Query('entityId') entityId: string,
    @Query('driverId') driverId: string,
    @Body('visibility') visibility: FavoriteDriverVisibility,
  ) {
    return this.favoriteDriversService.updateVisibility(entityId, driverId, visibility);
  }

  @Put('rating')
  @ApiOperation({ summary: 'Update personal rating for favorite driver' })
  updatePersonalRating(
    @Query('entityId') entityId: string,
    @Query('driverId') driverId: string,
    @Body('rating') rating: number,
  ) {
    return this.favoriteDriversService.updatePersonalRating(entityId, driverId, rating);
  }

  @Get('entity/:entityId/top-rated')
  @ApiOperation({ summary: 'Get top-rated favorite drivers for entity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopRatedFavorites(
    @Param('entityId') entityId: string,
    @Query('limit') limit?: string,
  ) {
    return this.favoriteDriversService.getTopRatedFavorites(
      entityId,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
