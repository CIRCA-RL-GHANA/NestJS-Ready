import { IsUUID, IsNumber, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRideFeedbackDto {
  @ApiProperty({ description: 'Ride ID' })
  @IsUUID()
  rideId: string;

  @ApiProperty({ description: 'Reviewee user ID' })
  @IsUUID()
  revieweeId: string;

  @ApiProperty({ description: 'Rating (1-5)', example: 4.5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Review tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
