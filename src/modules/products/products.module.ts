import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { DiscountTier } from './entities/discount-tier.entity';
import { SOSAlert } from './entities/sos-alert.entity';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductMedia, DiscountTier, SOSAlert, DeliveryZone]),
    AIModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
