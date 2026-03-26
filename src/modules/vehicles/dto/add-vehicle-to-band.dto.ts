import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddVehicleToBandDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Band ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  bandId: string;
}
