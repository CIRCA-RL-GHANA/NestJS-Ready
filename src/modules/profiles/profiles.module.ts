import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { VisibilitySettings } from './entities/visibility-settings.entity';
import { InteractionPreferences } from './entities/interaction-preferences.entity';
import { AuditLog } from '@modules/users/entities/audit-log.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, VisibilitySettings, InteractionPreferences, AuditLog]),
    AIModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
