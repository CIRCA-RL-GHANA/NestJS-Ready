import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'User making the payment' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Order ID (if payment is for an order)', required: false })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiProperty({ description: 'Ride ID (if payment is for a ride)', required: false })
  @IsUUID()
  @IsOptional()
  rideId?: string;

  @ApiProperty({ description: 'Payment amount', example: 50.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Currency code', example: 'NGN', required: false })
  @IsString()
  @IsOptional()
  currency?: string;
}
