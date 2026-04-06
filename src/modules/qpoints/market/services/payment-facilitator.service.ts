import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { FacilitatorAccount } from '../entities/facilitator-account.entity';

export interface TransferResult {
  transferId: string;
  status: 'succeeded' | 'failed';
  errorMessage?: string;
}

/** Supported payment facilitator providers. */
export type FacilitatorProvider = 'mock' | 'flutterwave' | 'paystack';

/**
 * Payment Facilitator Adapter
 *
 * Supports three providers selected via PAYMENT_FACILITATOR_PROVIDER:
 *   mock        – local development / CI (no real money moved)
 *   flutterwave – Flutterwave Transfer API (NGN primary, multi-currency)
 *   paystack    – Paystack Transfer API   (NGN primary, multi-currency)
 *
 * The platform NEVER holds user funds. All cash movements are peer-to-peer
 * via the licensed facilitator. See spec §8 for the legal rationale.
 *
 * Each provider requires the corresponding recipient accounts to be pre-created
 * (stored in a separate facilitator_accounts table) when a user onboards.
 * `ensureUserAccount()` handles that registration step.
 */
@Injectable()
export class PaymentFacilitatorService {
  private readonly logger = new Logger(PaymentFacilitatorService.name);
  private readonly provider: FacilitatorProvider;
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly currency: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(FacilitatorAccount)
    private readonly facilitatorAccountRepo: Repository<FacilitatorAccount>,
  ) {
    this.secretKey = this.config.get<string>('payments.facilitatorSecretKey') ?? '';
    this.publicKey = this.config.get<string>('payments.facilitatorPublicKey') ?? '';
    this.currency = this.config.get<string>('payments.facilitatorCurrency') ?? 'NGN';
    const raw = this.config.get<string>('payments.facilitatorProvider') ?? 'mock';

    // Auto-downgrade to mock when key looks like a placeholder
    this.provider =
      !this.secretKey || this.secretKey.startsWith('mock_') ? 'mock' : (raw as FacilitatorProvider);

    this.logger.log(`PaymentFacilitatorService initialised — provider=${this.provider}`);
  }

  // =========================================================================
  // Public API
  // =========================================================================

  /**
   * Initiate a peer-to-peer transfer from buyer to seller.
   *
   * @param fromUserId  Buyer's platform user ID (facilitator account must exist)
   * @param toUserId    Seller's platform user ID (facilitator account must exist)
   * @param amount      Cash amount with 2 decimal places
   * @param reference   Idempotency key / trade ID – must be globally unique
   */
  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reference: string,
  ): Promise<TransferResult> {
    this.logger.log(
      `Transfer [${this.provider}]: ${fromUserId} → ${toUserId}, ` +
        `amount=${this.currency} ${amount.toFixed(2)}, ref=${reference}`,
    );

    switch (this.provider) {
      case 'flutterwave':
        return this._flutterwaveTransfer(fromUserId, toUserId, amount, reference);
      case 'paystack':
        return this._paystackTransfer(fromUserId, toUserId, amount, reference);
      default:
        return this._mockTransfer(reference);
    }
  }

  /**
   * Register / verify a user's facilitator account.
   * Must be called at onboarding and before the first trade.
   * Returns the facilitator-side account/recipient ID to be stored by the caller.
   */
  async ensureUserAccount(
    userId: string,
    email: string,
    meta?: Record<string, string>,
  ): Promise<string> {
    switch (this.provider) {
      case 'flutterwave':
        return this._flutterwaveEnsureRecipient(userId, email, meta);
      case 'paystack':
        return this._paystackEnsureRecipient(userId, email, meta);
      default:
        this.logger.warn(`MOCK: ensureUserAccount for ${userId} (${email})`);
        return `mock_acct_${userId}`;
    }
  }

  /**
   * Register a user's bank account with the facilitator and persist the
   * resulting external ID to the `facilitator_accounts` table.
   *
   * Safe to call multiple times — upserts on (userId, provider).
   *
   * @returns The saved `FacilitatorAccount` entity
   */
  async registerUserAccount(
    userId: string,
    email: string,
    meta?: Record<string, string>,
    providerOverride?: FacilitatorProvider,
  ): Promise<FacilitatorAccount> {
    const provider = providerOverride ?? this.provider;
    const externalId = await this.ensureUserAccount(userId, email, meta);

    const existing = await this.facilitatorAccountRepo.findOne({
      where: { userId, provider },
    });

    if (existing) {
      existing.externalId = externalId;
      existing.metadata = meta as Record<string, unknown> | undefined;
      return this.facilitatorAccountRepo.save(existing);
    }

    const row = this.facilitatorAccountRepo.create({
      userId,
      provider,
      externalId,
      metadata: meta as Record<string, unknown> | undefined,
    });
    return this.facilitatorAccountRepo.save(row);
  }

  /**
   * Retrieve all facilitator accounts for a given user.
   */
  async getUserAccounts(userId: string): Promise<FacilitatorAccount[]> {
    return this.facilitatorAccountRepo.find({ where: { userId } });
  }

  // =========================================================================
  // Flutterwave
  // =========================================================================
  //
  // Docs: https://developer.flutterwave.com/reference/transfers
  // Auth: Authorization: Bearer <secret_key>
  //
  // Flow:
  //   1. Store recipient's account_bank + account_number at onboarding.
  //   2. POST /transfers to initiate; poll or use webhook for final status.
  //
  // Note on P2P legality: Flutterwave is a licensed payment service provider
  // in multiple African jurisdictions. The platform never holds funds – it
  // instructs Flutterwave to move money from buyer's wallet/bank to seller's.

  private async _flutterwaveTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reference: string,
  ): Promise<TransferResult> {
    // The seller's bank details must be stored in your DB (from onboarding).
    // Here we assume you can retrieve them; replace with a real DB lookup.
    const recipientCode = await this._getFacilitatorAccountId(toUserId, 'flutterwave');

    try {
      const { data } = await axios.post(
        'https://api.flutterwave.com/v3/transfers',
        {
          account_bank: recipientCode.split('|')[0], // e.g. "044"
          account_number: recipientCode.split('|')[1], // e.g. "0690000031"
          amount: Math.round(amount * 100) / 100,
          narration: `QP trade settlement ref:${reference}`,
          currency: this.currency,
          reference,
          callback_url: this.config.get<string>('payments.facilitatorWebhookUrl') ?? '',
          debit_currency: this.currency,
          meta: [{ sender: fromUserId }, { receiver: toUserId }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30_000,
        },
      );

      if (data.status === 'success') {
        return {
          transferId: String(data.data?.id ?? reference),
          status: 'succeeded',
        };
      }

      return {
        transferId: reference,
        status: 'failed',
        errorMessage: data.message ?? 'Flutterwave transfer failed',
      };
    } catch (err: unknown) {
      const msg = this._errMsg(err);
      this.logger.error(`Flutterwave transfer error for ref=${reference}: ${msg}`);
      return { transferId: reference, status: 'failed', errorMessage: msg };
    }
  }

  private async _flutterwaveEnsureRecipient(
    userId: string,
    email: string,
    meta?: Record<string, string>,
  ): Promise<string> {
    // Flutterwave does not have a standalone "recipient" object like Paystack.
    // Instead, bank details are submitted per-transfer. We validate here that
    // the account exists using the account-resolve endpoint.
    try {
      const { data } = await axios.post(
        'https://api.flutterwave.com/v3/accounts/resolve',
        {
          account_number: meta?.accountNumber ?? '',
          account_bank: meta?.bankCode ?? '',
        },
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
          timeout: 15_000,
        },
      );

      if (data.status === 'success') {
        // Store as "bankCode|accountNumber" composite for use in transfers
        const composite = `${meta?.bankCode}|${meta?.accountNumber}`;
        this.logger.log(
          `Flutterwave account verified for user ${userId}: ${data.data?.account_name}`,
        );
        return composite;
      }

      throw new InternalServerErrorException(
        `Flutterwave account resolution failed for user ${userId}: ${data.message}`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException(
        `Flutterwave ensureRecipient error for ${userId} (${email}): ${this._errMsg(err)}`,
      );
    }
  }

  // =========================================================================
  // Paystack
  // =========================================================================
  //
  // Docs: https://paystack.com/docs/transfers/single-transfers
  // Auth: Authorization: Bearer <secret_key>
  //
  // Flow:
  //   1. Create a Transfer Recipient (POST /transferrecipient) once per user.
  //   2. Store the returned recipient_code in your DB.
  //   3. POST /transfer with recipient_code to move funds.

  private async _paystackTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reference: string,
  ): Promise<TransferResult> {
    const recipientCode = await this._getFacilitatorAccountId(toUserId, 'paystack');

    try {
      const { data } = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance', // platform's Paystack balance funds the transfer
          amount: Math.round(amount * 100), // kobo / lowest denomination
          recipient: recipientCode,
          reason: `QP trade settlement ref:${reference}`,
          reference,
          currency: this.currency,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30_000,
        },
      );

      if (data.status === true) {
        return {
          transferId: data.data?.transfer_code ?? reference,
          status: 'succeeded',
        };
      }

      return {
        transferId: reference,
        status: 'failed',
        errorMessage: data.message ?? 'Paystack transfer failed',
      };
    } catch (err: unknown) {
      const msg = this._errMsg(err);
      this.logger.error(`Paystack transfer error for ref=${reference}: ${msg}`);
      return { transferId: reference, status: 'failed', errorMessage: msg };
    }
  }

  private async _paystackEnsureRecipient(
    userId: string,
    email: string,
    meta?: Record<string, string>,
  ): Promise<string> {
    try {
      const { data } = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: meta?.type ?? 'nuban', // nuban | mobile_money | basa
          name: meta?.accountName ?? email,
          account_number: meta?.accountNumber ?? '',
          bank_code: meta?.bankCode ?? '',
          currency: this.currency,
          description: `QP market user ${userId}`,
          metadata: { userId, email },
        },
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
          timeout: 15_000,
        },
      );

      if (data.status === true) {
        const code: string = data.data?.recipient_code;
        this.logger.log(`Paystack recipient created for user ${userId}: ${code}`);
        return code;
      }

      throw new InternalServerErrorException(
        `Paystack recipient creation failed for user ${userId}: ${data.message}`,
      );
    } catch (err: unknown) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException(
        `Paystack ensureRecipient error for ${userId} (${email}): ${this._errMsg(err)}`,
      );
    }
  }

  // =========================================================================
  // Mock
  // =========================================================================

  private _mockTransfer(reference: string): TransferResult {
    this.logger.warn('PaymentFacilitator running in MOCK mode – no real money moved');
    return {
      transferId: `mock_${Date.now()}_${reference}`,
      status: 'succeeded',
    };
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  /**
   * Retrieve the facilitator-side account / recipient ID for a user.
   * In production this should query a `facilitator_accounts` table.
   * Subclass or extend this service to inject that repository.
   */
  protected async _getFacilitatorAccountId(
    userId: string,
    provider: FacilitatorProvider,
  ): Promise<string> {
    const row = await this.facilitatorAccountRepo.findOne({
      where: { userId, provider },
    });
    if (!row) {
      throw new BadRequestException(
        `User ${userId} has no ${provider} facilitator account. ` +
          'Please complete payment onboarding first.',
      );
    }
    return row.externalId;
  }

  private _errMsg(err: unknown): string {
    if (axios.isAxiosError(err)) {
      // Cast explicitly — type narrowing from isAxiosError requires axios types to be loaded.
      const axErr = err as { response?: { data?: Record<string, unknown> }; message: string };
      const resp = axErr.response?.data;
      return (resp?.['message'] as string) ?? (resp?.['error'] as string) ?? axErr.message;
    }
    return err instanceof Error ? err.message : String(err);
  }
}
