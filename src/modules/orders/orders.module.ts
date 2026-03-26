import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FulfillmentSession } from './entities/fulfillment-session.entity';
import { ReturnRequest } from './entities/return-request.entity';
import { Delivery } from './entities/delivery.entity';
import { DeliveryPackage } from './entities/delivery-package.entity';
import { ProductsModule } from '../products/products.module';
import { QPointsModule } from '../qpoints/qpoints.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      FulfillmentSession,
      ReturnRequest,
      Delivery,
      DeliveryPackage,
    ]),
    ProductsModule,
    QPointsModule,
    AIModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
