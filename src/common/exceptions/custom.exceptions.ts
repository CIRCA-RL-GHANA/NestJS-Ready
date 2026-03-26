import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    super(
      {
        error: 'RESOURCE_NOT_FOUND',
        message: `${resource}${id ? ` with id ${id}` : ''} not found`,
        details: { resource, id },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: any[]) {
    super(
      {
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string) {
    super(
      {
        error: 'DUPLICATE_RESOURCE',
        message: `${resource} with this ${field} already exists`,
        details: { resource, field },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InsufficientBalanceException extends HttpException {
  constructor(required: number, available: number) {
    super(
      {
        error: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient QPoints balance',
        details: { required, available },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class RateLimitExceededException extends HttpException {
  constructor(retryAfterSeconds: number) {
    super(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: { retryAfterSeconds },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class FeatureNotAvailableException extends HttpException {
  constructor(feature: string, reason?: string) {
    super(
      {
        error: 'FEATURE_NOT_AVAILABLE',
        message: `Feature "${feature}" is not available${reason ? `: ${reason}` : ''}`,
        details: { feature, reason },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
