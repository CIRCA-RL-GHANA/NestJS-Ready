import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { CreateDiscountTierDto } from './dto/create-discount-tier.dto';
import { UpdateDiscountTierDto } from './dto/update-discount-tier.dto';
import { CreateSOSAlertDto } from './dto/create-sos-alert.dto';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { ProductStatus } from './entities/product.entity';
import { SOSStatus } from './entities/sos-alert.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Product Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created successfully' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  getProducts(
    @Query('branchId') branchId?: string,
    @Query('category') category?: string,
    @Query('status') status?: ProductStatus,
    @Query('isFeatured') isFeatured?: string,
  ) {
    return this.productsService.getProducts(
      branchId,
      category,
      status,
      isFeatured ? isFeatured === 'true' : undefined,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiQuery({ name: 'q', required: true })
  searchProducts(@Query('q') query: string) {
    return this.productsService.searchProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a product' })
  patchProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Partially update product stock quantity' })
  patchStockQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('operation') operation?: string,
  ) {
    return this.productsService.updateStockQuantity(id, quantity, operation);
  }

  @Put(':id/stock')
  @ApiOperation({ summary: 'Update product stock quantity' })
  updateStockQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('operation') operation?: string,
  ) {
    return this.productsService.updateStockQuantity(id, quantity, operation);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment product view count' })
  incrementViewCount(@Param('id') id: string) {
    return this.productsService.incrementViewCount(id);
  }

  @Put(':id/rating')
  @ApiOperation({ summary: 'Update product rating' })
  updateRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('reviewCount') reviewCount: number,
  ) {
    return this.productsService.updateRating(id, rating, reviewCount);
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Partially update product rating' })
  patchRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('reviewCount') reviewCount: number,
  ) {
    return this.productsService.updateRating(id, rating, reviewCount);
  }

  @Post(':id/rating')
  @ApiOperation({ summary: 'Submit product rating (POST)' })
  postRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('reviewCount') reviewCount: number,
  ) {
    return this.productsService.updateRating(id, rating, reviewCount ?? 1);
  }

  // Product Media Endpoints
  @Post('media')
  @ApiOperation({ summary: 'Add media to a product' })
  addProductMedia(@Body() createMediaDto: CreateProductMediaDto) {
    return this.productsService.addProductMedia(createMediaDto);
  }

  @Get(':productId/media')
  @ApiOperation({ summary: 'Get all media for a product' })
  getProductMedia(@Param('productId') productId: string) {
    return this.productsService.getProductMedia(productId);
  }

  @Delete('media/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product media' })
  deleteProductMedia(@Param('id') id: string) {
    return this.productsService.deleteProductMedia(id);
  }

  // Discount Tier Endpoints
  @Post('discounts')
  @ApiOperation({ summary: 'Create a discount tier' })
  createDiscountTier(
    @Body() dto: CreateDiscountTierDto,
    @Query('createdBy') createdBy: string,
  ) {
    return this.productsService.createDiscountTier(createdBy, dto);
  }

  @Get('discounts')
  @ApiOperation({ summary: 'Get discount tiers with optional filters' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  getDiscountTiers(
    @Query('productId') productId?: string,
    @Query('branchId') branchId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productsService.getDiscountTiers(
      productId,
      branchId,
      isActive ? isActive === 'true' : undefined,
    );
  }

  @Get(':productId/active-discounts')
  @ApiOperation({ summary: 'Get active discounts for a product' })
  getActiveDiscountsForProduct(@Param('productId') productId: string) {
    return this.productsService.getActiveDiscountsForProduct(productId);
  }

  @Put('discounts/:id')
  @ApiOperation({ summary: 'Update a discount tier' })
  updateDiscountTier(@Param('id') id: string, @Body() dto: UpdateDiscountTierDto) {
    return this.productsService.updateDiscountTier(id, dto);
  }

  @Delete('discounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a discount tier' })
  deleteDiscountTier(@Param('id') id: string) {
    return this.productsService.deleteDiscountTier(id);
  }

  // SOS Alert Endpoints
  @Post('sos')
  @ApiOperation({ summary: 'Create an SOS alert' })
  createSOSAlert(@Body() dto: CreateSOSAlertDto) {
    return this.productsService.createSOSAlert(dto);
  }

  @Get('sos')
  @ApiOperation({ summary: 'Get SOS alerts with optional filters' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'recipientId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SOSStatus })
  getSOSAlerts(
    @Query('userId') userId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('status') status?: SOSStatus,
  ) {
    return this.productsService.getSOSAlerts(userId, recipientId, status);
  }

  @Put('sos/:id/resolve')
  @ApiOperation({ summary: 'Resolve an SOS alert' })
  resolveSOSAlert(@Param('id') id: string, @Body('resolutionNotes') resolutionNotes?: string) {
    return this.productsService.resolveSOSAlert(id, resolutionNotes);
  }

  @Put('sos/:id/cancel')
  @ApiOperation({ summary: 'Cancel an SOS alert' })
  cancelSOSAlert(@Param('id') id: string) {
    return this.productsService.cancelSOSAlert(id);
  }

  // Delivery Zone Endpoints
  @Post('delivery-zones')
  @ApiOperation({ summary: 'Create a delivery zone' })
  createDeliveryZone(@Body() dto: CreateDeliveryZoneDto) {
    return this.productsService.createDeliveryZone(dto);
  }

  @Get('delivery-zones')
  @ApiOperation({ summary: 'Get delivery zones with optional filters' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  getDeliveryZones(
    @Query('branchId') branchId?: string,
    @Query('active') active?: string,
  ) {
    return this.productsService.getDeliveryZones(
      branchId,
      active ? active === 'true' : undefined,
    );
  }

  @Get('delivery-zones/:id')
  @ApiOperation({ summary: 'Get delivery zone by ID' })
  getDeliveryZoneById(@Param('id') id: string) {
    return this.productsService.getDeliveryZoneById(id);
  }

  @Get('delivery-zones/find-by-location')
  @ApiOperation({ summary: 'Find delivery zone by location' })
  @ApiQuery({ name: 'branchId', required: true })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  findZoneByLocation(
    @Query('branchId') branchId: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    return this.productsService.findZoneByLocation(
      branchId,
      parseFloat(latitude),
      parseFloat(longitude),
    );
  }

  @Put('delivery-zones/:id')
  @ApiOperation({ summary: 'Update a delivery zone' })
  updateDeliveryZone(@Param('id') id: string, @Body() dto: UpdateDeliveryZoneDto) {
    return this.productsService.updateDeliveryZone(id, dto);
  }

  @Delete('delivery-zones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a delivery zone' })
  deleteDeliveryZone(@Param('id') id: string) {
    return this.productsService.deleteDeliveryZone(id);
  }

  // === Additional endpoints for frontend parity ===

  @Get('entity/:entityId')
  @ApiOperation({ summary: 'Get products by entity/branch ID' })
  getProductsByEntity(@Param('entityId') entityId: string) {
    return this.productsService.getProductsByEntity(entityId);
  }

  @Get('discounts/:id')
  @ApiOperation({ summary: 'Get discount tier by ID' })
  getDiscountTierById(@Param('id') id: string) {
    return this.productsService.getDiscountTierById(id);
  }

  @Get('delivery-zones/product/:productId')
  @ApiOperation({ summary: 'Get delivery zones by product' })
  getDeliveryZonesByProduct(@Param('productId') productId: string) {
    return this.productsService.getDeliveryZonesByProduct(productId);
  }
}
