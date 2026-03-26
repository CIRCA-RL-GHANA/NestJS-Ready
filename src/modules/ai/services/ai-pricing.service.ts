import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export interface PricingContext {
  baseDistance: number;       // km
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  rideType?: string;
  requestedAt?: Date;
  passengerId?: string;
}

export interface DynamicPrice {
  basePrice: number;
  surgeMultiplier: number;
  finalPrice: number;
  breakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeFee: number;
    platformFee: number;
  };
  estimatedMinutes: number;
  confidence: number;
  reason: string;
}

export interface DiscountRecommendation {
  recommendedDiscount: number;  // 0–1 (percentage)
  expectedRevenueLift: number;  // estimated additional revenue
  reason: string;
  expiryHours: number;
}

@Injectable()
export class AIPricingService {
  private readonly logger = new Logger(AIPricingService.name);

  // Base rates
  private readonly BASE_FARE        = 5.0;      // fixed base regardless of distance
  private readonly PER_KM_RATE      = 2.5;
  private readonly PER_MINUTE_RATE  = 0.35;
  private readonly PLATFORM_FEE_PCT = 0.08;     // 8%
  private readonly SPEED_KMH        = 40;       // average urban speed

  constructor(private readonly configService: ConfigService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // SURGE MULTIPLIER
  // ─────────────────────────────────────────────────────────────────────────

  computeSurgeMultiplier(demandFactor: number, supplyFactor: number, now?: Date): number {
    const date        = now ?? new Date();
    const hour        = date.getHours();
    const dayOfWeek   = date.getDay(); // 0 = Sunday

    // Peak hour factor (morning 7-9, evening 17-20)
    const isPeakHour  = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    const isLateNight = hour >= 23 || hour <= 4;
    const isWeekend   = dayOfWeek === 0 || dayOfWeek === 6;

    let surge = 1.0;

    // Demand vs supply ratio
    if (supplyFactor > 0) {
      const ratio = demandFactor / supplyFactor;
      if (ratio > 2.0) {
        surge = Math.min(3.5, 1.0 + (ratio - 1.0) * 0.8);
      } else if (ratio > 1.5) {
        surge = Math.min(2.0, 1.0 + (ratio - 1.0) * 0.6);
      } else if (ratio > 1.0) {
        surge = 1.0 + (ratio - 1.0) * 0.3;
      }
    }

    // Time-based modifiers
    if (isPeakHour)  surge *= 1.25;
    if (isWeekend)   surge *= 1.10;
    if (isLateNight) surge *= 1.15;  // late-night safety premium

    return parseFloat(Math.min(3.5, Math.max(1.0, surge)).toFixed(2));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DYNAMIC RIDE PRICING
  // ─────────────────────────────────────────────────────────────────────────

  computeRidePrice(
    ctx: PricingContext,
    demandFactor = 1.0,
    supplyFactor = 1.0,
  ): DynamicPrice {
    const surge          = this.computeSurgeMultiplier(demandFactor, supplyFactor, ctx.requestedAt);
    const estimatedMins  = Math.round((ctx.baseDistance / this.SPEED_KMH) * 60);

    const distanceFare   = parseFloat((ctx.baseDistance * this.PER_KM_RATE).toFixed(2));
    const timeFare       = parseFloat((estimatedMins  * this.PER_MINUTE_RATE).toFixed(2));
    const preGross       = this.BASE_FARE + distanceFare + timeFare;
    const surgeFee       = parseFloat(((surge - 1.0) * preGross).toFixed(2));
    const gross          = preGross + surgeFee;
    const platformFee    = parseFloat((gross * this.PLATFORM_FEE_PCT).toFixed(2));
    const finalPrice     = parseFloat((gross + platformFee).toFixed(2));

    const reasons: string[] = [];
    if (surge > 1.5) reasons.push('high demand area');
    else if (surge > 1.2) reasons.push('moderate demand');

    const now = ctx.requestedAt ?? new Date();
    const h   = now.getHours();
    if ((h >= 7 && h <= 9) || (h >= 17 && h <= 20)) reasons.push('peak hours');

    return {
      basePrice:        parseFloat(preGross.toFixed(2)),
      surgeMultiplier:  surge,
      finalPrice,
      breakdown: {
        baseFare:    this.BASE_FARE,
        distanceFare,
        timeFare,
        surgeFee,
        platformFee,
      },
      estimatedMinutes: estimatedMins,
      confidence:      parseFloat(Math.min(0.95, 0.65 + (1 - Math.abs(surge - 1) / 3)).toFixed(4)),
      reason:          reasons.length ? reasons.join(', ') : 'standard pricing',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DISCOUNT OPTIMISATION (products / subscriptions)
  // ─────────────────────────────────────────────────────────────────────────

  recommendDiscount(
    currentPrice: number,
    daysSinceLastSale: number,
    viewCount: number,
    conversionRate: number,   // 0–1: views that converted to sales
    stockLevel: number,
  ): DiscountRecommendation {
    let discount   = 0;
    const reasons: string[] = [];

    // Low conversion despite views → price too high
    if (viewCount > 50 && conversionRate < 0.02) {
      discount    += 0.10;
      reasons.push('low conversion rate');
    }

    // Stale stock
    if (daysSinceLastSale > 30) {
      discount    += 0.08 + Math.min(0.10, (daysSinceLastSale - 30) / 300);
      reasons.push('slow-moving inventory');
    }

    // High stock suggests clearance opportunity
    if (stockLevel > 200) {
      discount    += 0.05;
      reasons.push('high stock level');
    }

    discount = parseFloat(Math.min(0.40, discount).toFixed(2));

    // Expected revenue lift: demand elasticity -1.5 → each 10% ↓ price = ~15% ↑ volume
    const priceDrop     = discount * currentPrice;
    const elasticity    = 1.5;
    const volGain       = discount * elasticity;
    const revenueLift   = parseFloat(((volGain - discount) * currentPrice).toFixed(2));

    return {
      recommendedDiscount: discount,
      expectedRevenueLift: Math.max(0, revenueLift),
      reason:     reasons.length ? reasons.join('; ') : 'no discount recommended',
      expiryHours: discount > 0 ? 48 : 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION CHURN-RISK PRICING
  // ─────────────────────────────────────────────────────────────────────────

  suggestRetentionDiscount(
    monthsSubscribed: number,
    lastLoginDaysAgo: number,
    featureUsageScore: number,   // 0–1
    currentMonthlyPrice: number,
  ): { offerDiscount: number; retentionProbability: number; offerMessage: string } {
    const churnRisk =
      (lastLoginDaysAgo > 14 ? 0.3 : 0) +
      (featureUsageScore < 0.3 ? 0.25 : 0) +
      (monthsSubscribed < 3 ? 0.2 : 0);

    let offerDiscount = 0;
    if (churnRisk > 0.6) {
      offerDiscount = monthsSubscribed < 3 ? 0.50 : 0.30;
    } else if (churnRisk > 0.35) {
      offerDiscount = 0.15;
    }

    const discountedPrice = (currentMonthlyPrice * (1 - offerDiscount)).toFixed(2);
    return {
      offerDiscount,
      retentionProbability: parseFloat(Math.min(0.95, 0.40 + (1 - churnRisk) * 0.55).toFixed(4)),
      offerMessage:
        offerDiscount > 0
          ? `We value your loyalty! Enjoy ${(offerDiscount * 100).toFixed(0)}% off — just $${discountedPrice}/month for the next 3 months.`
          : 'Thank you for being a valued subscriber!',
    };
  }
}
