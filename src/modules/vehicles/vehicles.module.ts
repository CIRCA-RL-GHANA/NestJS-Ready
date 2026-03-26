import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehicleBand } from './entities/vehicle-band.entity';
import { VehicleBandMembership } from './entities/vehicle-band-membership.entity';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleAssignment } from './entities/vehicle-assignment.entity';
import { VehicleMedia } from './entities/vehicle-media.entity';
import { VehiclePricing } from './entities/vehicle-pricing.entity';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleBand,
      VehicleBandMembership,
      Vehicle,
      VehicleAssignment,
      VehicleMedia,
      VehiclePricing,
    ]),
    AIModule,
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
