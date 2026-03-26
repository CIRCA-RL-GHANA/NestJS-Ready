/**
 * Standardized error codes used across backend responses and frontend handling.
 * These codes are returned in the `error.code` field of API error responses.
 */
export const ERROR_CODES = {
  // ─── Auth ──────────────────────────────────────────
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',
  BIOMETRIC_NOT_VERIFIED: 'BIOMETRIC_NOT_VERIFIED',

  // ─── Validation ───────────────────────────────────
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // ─── Resource ─────────────────────────────────────
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // ─── QPoints ──────────────────────────────────────
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  FRAUD_DETECTED: 'FRAUD_DETECTED',
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',

  // ─── User/Registration ────────────────────────────
  PHONE_EXISTS: 'PHONE_EXISTS',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  WIRE_ID_EXISTS: 'WIRE_ID_EXISTS',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',

  // ─── Permissions ──────────────────────────────────
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',

  // ─── Rate Limiting ────────────────────────────────
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // ─── Server ───────────────────────────────────────
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // ─── Network (Frontend only) ──────────────────────
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
