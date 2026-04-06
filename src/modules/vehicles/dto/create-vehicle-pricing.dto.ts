import { IsUUID, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehiclePricingDto {
  @ApiProperty({
    description: 'Vehicle ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Branch ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Allowable wait time in minutes before charges apply',
    example: 5,
  })
  @IsInt()
  @Min(0)
  allowableWaitTime: number;

  @ApiProperty({
    description: 'Price per minute after allowable wait time',
    example: 2.5,
  })
  @IsNumber()
  @Min(0)
  pricePerMinute: number;
}
