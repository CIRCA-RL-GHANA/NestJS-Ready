import { PartialType } from '@nestjs/swagger';
import { CreateVehicleBandDto } from './create-vehicle-band.dto';

export class UpdateVehicleBandDto extends PartialType(CreateVehicleBandDto) {}
