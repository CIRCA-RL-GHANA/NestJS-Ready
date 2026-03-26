import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketProfile } from './entities/market-profile.entity';
import { MarketNotification } from './entities/market-notification.entity';
import { MarketProfilesService } from './market-profiles.service';
import { MarketProfilesController } from './market-profiles.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketProfile,
      MarketNotification,
    ]),
    AIModule,
  ],
  controllers: [MarketProfilesController],
  providers: [MarketProfilesService],
  exports: [TypeOrmModule, MarketProfilesService],
})
export class MarketProfilesModule {}
