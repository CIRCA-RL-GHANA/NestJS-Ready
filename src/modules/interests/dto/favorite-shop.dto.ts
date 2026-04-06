import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AddFavoriteShopDto {
  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  entityId: string;

  @ApiProperty({
    description: 'Shop (Branch) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  shopId: string;

  @ApiProperty({
    description: 'Notes about the favorite shop',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RemoveFavoriteShopDto {
  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  entityId: string;

  @ApiProperty({
    description: 'Shop (Branch) ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  shopId: string;
}
