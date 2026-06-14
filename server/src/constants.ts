import type { CardType, ErrorCode } from '@ccv/shared';

/** API route paths — single source of truth for routing and tests. */
export const ROUTES = {
  VALIDATE: '/validate',
  HEALTH: '/health',
  API_PREFIX: '/api',
} as const;

/** Validation boundaries (industry standard, 13-19 digits). */
export const CARD_LENGTH = {
  MIN: 13,
  MAX: 19,
} as const;

/** Express body-parser size cap — a card payload is tiny, so reject anything large. */
export const BODY_LIMIT = '1kb';

/** Health-probe payload. */
export const HEALTH_RESPONSE = { status: 'ok' } as const;

/** Validation and error-handler messages — consistent, testable, reusable. */
export const ERRORS = {
  CARD_REQUIRED: 'Card number is required and must be a string.',
  CARD_EMPTY: 'Card number cannot be empty.',
  DIGITS_ONLY: 'Card number must contain only digits.',
  LENGTH_RANGE: `Card number must be ${CARD_LENGTH.MIN}-${CARD_LENGTH.MAX} digits.`,
  ALL_ZEROS: 'Card number cannot be all zeros.',
  LUHN_FAILED: 'Card number failed the Luhn checksum.',
  INVALID_BODY: 'Invalid request body.',
  INTERNAL: 'Internal server error.',
} as const;

/** Messages that need a value interpolated at the point of failure. */
export const MESSAGES = {
  networkLength: (type: CardType) => `Card number length is not valid for ${type}.`,
} as const;

/** Machine-readable error codes returned in API responses. */
export const ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL: 'INTERNAL_ERROR',
} as const satisfies Record<string, ErrorCode>;
