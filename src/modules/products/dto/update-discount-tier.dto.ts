import { PartialType } from '@nestjs/swagger';
import { CreateDiscountTierDto } from './create-discount-tier.dto';

export class UpdateDiscountTierDto extends PartialType(CreateDiscountTierDto) {}
