import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoTransaction } from './entities/go-transaction.entity';
import { GoService } from './go.service';
import { GoController } from './go.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([GoTransaction]), WalletsModule, AIModule],
  controllers: [GoController],
  providers: [GoService],
  exports: [GoService],
})
export class GoModule {}
