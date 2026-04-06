import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Payload for registering a user's bank account with a payment facilitator. */
export class RegisterFacilitatorAccountDto {
  /**
   * Which facilitator provider to register the account with.
   * Defaults to the value set in PAYMENT_FACILITATOR_PROVIDER.
   */
  @ApiPropertyOptional({
    enum: ['flutterwave', 'paystack', 'mock'],
    description: 'Payment provider (defaults to the configured PAYMENT_FACILITATOR_PROVIDER)',
    example: 'paystack',
  })
  @IsOptional()
  @IsIn(['flutterwave', 'paystack', 'mock'])
  provider?: 'flutterwave' | 'paystack' | 'mock';

  /** User's email address (used for recipient creation metadata). */
  @ApiProperty({ example: 'user@genieinprompt.app' })
  @IsEmail()
  email: string;

  /**
   * Recipient bank account number.
   * Required for Paystack (nuban) and Flutterwave transfers.
   */
  @ApiPropertyOptional({ example: '0690000031' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  accountNumber?: string;

  /**
   * Recipient bank code (CBN / GHlink code).
   * Required for Paystack nuban and Flutterwave transfers.
   */
  @ApiPropertyOptional({
    example: '044',
    description: 'CBN bank code (Nigeria) or provider-specific bank code',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10)
  bankCode?: string;

  /**
   * Account holder name (used by Paystack; resolved automatically by Flutterwave).
   */
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountName?: string;

  /**
   * Recipient type (Paystack only).
   * @default 'nuban'
   */
  @ApiPropertyOptional({ enum: ['nuban', 'mobile_money', 'basa'], default: 'nuban' })
  @IsOptional()
  @IsIn(['nuban', 'mobile_money', 'basa'])
  type?: string;
}
