import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FulfillmentSession } from './entities/fulfillment-session.entity';
import { ReturnRequest } from './entities/return-request.entity';
import { Delivery, DeliveryStatus } from './entities/delivery.entity';
import { DeliveryPackage } from './entities/delivery-package.entity';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  async createOrder(
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.createOrder(buyerId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.getOrder(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved', type: [Order] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserOrders(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ): Promise<Order[]> {
    return this.ordersService.getUserOrders(userId, limit);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get order items' })
  @ApiResponse({ status: 200, description: 'Order items retrieved', type: [OrderItem] })
  async getOrderItems(@Param('id') id: string): Promise<OrderItem[]> {
    return this.ordersService.getOrderItems(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Partially update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated', type: Order })
  async patchOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated', type: Order })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Post(':id/fulfillment/start')
  @ApiOperation({ summary: 'Start order fulfillment' })
  @ApiResponse({ status: 201, description: 'Fulfillment started', type: FulfillmentSession })
  async startFulfillment(
    @Param('id') orderId: string,
    @CurrentUser('id') fulfillerId: string,
  ): Promise<FulfillmentSession> {
    return this.ordersService.startFulfillment(orderId, fulfillerId);
  }

  @Put('fulfillment/:sessionId/complete')
  @ApiOperation({ summary: 'Complete order fulfillment' })
  @ApiResponse({ status: 200, description: 'Fulfillment completed', type: FulfillmentSession })
  async completeFulfillment(@Param('sessionId') sessionId: string): Promise<FulfillmentSession> {
    return this.ordersService.completeFulfillment(sessionId);
  }

  @Post('fulfillment/:sessionId/complete')
  @ApiOperation({ summary: 'Complete order fulfillment (POST)' })
  @ApiResponse({ status: 200, description: 'Fulfillment completed', type: FulfillmentSession })
  async completeFulfillmentPost(
    @Param('sessionId') sessionId: string,
  ): Promise<FulfillmentSession> {
    return this.ordersService.completeFulfillment(sessionId);
  }

  @Post('returns')
  @ApiOperation({ summary: 'Create return request' })
  @ApiResponse({ status: 201, description: 'Return request created', type: ReturnRequest })
  async createReturnRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReturnRequestDto,
  ): Promise<ReturnRequest> {
    return this.ordersService.createReturnRequest(userId, dto);
  }

  @Put('returns/:id/status')
  @ApiOperation({ summary: 'Update return request status' })
  @ApiResponse({ status: 200, description: 'Return status updated', type: ReturnRequest })
  async updateReturnStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReturnStatusDto,
  ): Promise<ReturnRequest> {
    return this.ordersService.updateReturnStatus(id, dto);
  }

  @Get('returns/user/:userId')
  @ApiOperation({ summary: 'Get user return requests' })
  @ApiResponse({ status: 200, description: 'Return requests retrieved', type: [ReturnRequest] })
  async getReturnRequests(@Param('userId') userId: string): Promise<ReturnRequest[]> {
    return this.ordersService.getReturnRequests(userId);
  }

  @Post(':id/delivery')
  @ApiOperation({ summary: 'Create delivery for order' })
  @ApiResponse({ status: 201, description: 'Delivery created', type: Delivery })
  async createDelivery(
    @Param('id') orderId: string,
    @CurrentUser('id') driverId: string,
  ): Promise<Delivery> {
    return this.ordersService.createDelivery(orderId, driverId);
  }

  @Put('deliveries/:id/status')
  @ApiOperation({ summary: 'Update delivery status' })
  @ApiResponse({ status: 200, description: 'Delivery status updated', type: Delivery })
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.ordersService.updateDeliveryStatus(id, dto);
  }

  @Get('deliveries/driver/:driverId')
  @ApiOperation({ summary: 'Get driver deliveries' })
  @ApiResponse({ status: 200, description: 'Deliveries retrieved', type: [Delivery] })
  @ApiQuery({ name: 'status', required: false, enum: DeliveryStatus })
  async getDriverDeliveries(
    @Param('driverId') driverId: string,
    @Query('status') status?: DeliveryStatus,
  ): Promise<Delivery[]> {
    return this.ordersService.getDriverDeliveries(driverId, status);
  }

  @Post('packages')
  @ApiOperation({ summary: 'Create delivery package for multiple orders' })
  @ApiResponse({ status: 201, description: 'Package created', type: DeliveryPackage })
  async createDeliveryPackage(
    @CurrentUser('id') driverId: string,
    @Body('orderIds') orderIds: string[],
  ): Promise<DeliveryPackage> {
    return this.ordersService.createDeliveryPackage(driverId, orderIds);
  }

  @Get('packages/driver/:driverId')
  @ApiOperation({ summary: 'Get driver packages' })
  @ApiResponse({ status: 200, description: 'Packages retrieved', type: [DeliveryPackage] })
  async getDriverPackages(@Param('driverId') driverId: string): Promise<DeliveryPackage[]> {
    return this.ordersService.getDriverPackages(driverId);
  }
}
