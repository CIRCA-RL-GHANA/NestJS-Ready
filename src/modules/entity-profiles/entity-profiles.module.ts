import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityProfilesController } from './entity-profiles.controller';
import { EntityProfilesService } from './entity-profiles.service';
import { EntityProfileSettings } from './entities/entity-profile-settings.entity';
import { OperatingHours } from './entities/operating-hours.entity';
import { BusinessCategory } from './entities/business-category.entity';
import { AuditLog } from '@modules/users/entities/audit-log.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntityProfileSettings,
      OperatingHours,
      BusinessCategory,
      AuditLog,
    ]),
    AIModule,
  ],
  controllers: [EntityProfilesController],
  providers: [EntityProfilesService],
  exports: [EntityProfilesService, TypeOrmModule],
})
export class EntityProfilesModule {}
