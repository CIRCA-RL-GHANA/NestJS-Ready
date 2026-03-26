import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteShop } from './entities/favorite-shop.entity';
import { Interest } from './entities/interest.entity';
import { ConnectionRequest } from './entities/connection-request.entity';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteShop,
      Interest,
      ConnectionRequest,
    ]),
    AIModule,
  ],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [TypeOrmModule, InterestsService],
})
export class InterestsModule {}
