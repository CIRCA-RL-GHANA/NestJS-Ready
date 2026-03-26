import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { EntityProfile } from './entities/entity.entity';
import { Branch } from './entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog } from '../users/entities/audit-log.entity';
import { QPointAccount } from '../qpoints/entities/qpoint-account.entity';
import { BoosterPointsAccount } from '../qpoints/entities/booster-points-account.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([EntityProfile, Branch, User, AuditLog, QPointAccount, BoosterPointsAccount]), AIModule],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService, TypeOrmModule],
})
export class EntitiesModule {}
