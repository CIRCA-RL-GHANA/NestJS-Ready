import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteDriversController } from './favorite-drivers.controller';
import { FavoriteDriversService } from './favorite-drivers.service';
import { FavoriteDriver } from './entities/favorite-driver.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteDriver]), AIModule],
  controllers: [FavoriteDriversController],
  providers: [FavoriteDriversService],
  exports: [FavoriteDriversService],
})
export class FavoriteDriversModule {}
