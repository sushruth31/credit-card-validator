import { isValidLuhn } from './luhn.js';
import { getCardType, hasNetworkLength } from './cardType.js';
import { CARD_LENGTH, ERRORS, MESSAGES } from './constants.js';
import type { ValidationResponse } from '@ccv/shared';

/** A rule the sanitised digits must satisfy, and the reason given when they do not. */
interface Rule {
  readonly holds: (digits: string) => boolean;
  readonly reason: (digits: string) => string;
}

/**
 * Rules in evaluation order: structural checks first, checksum last, so the
 * message a caller sees names the most specific thing that is wrong. The
 * all-zeros rule is not redundant — '0000000000000000' satisfies Luhn, since a
 * sum of zero is a multiple of ten.
 */
const RULES: readonly Rule[] = [
  { holds: (digits) => /^\d+$/.test(digits), reason: () => ERRORS.DIGITS_ONLY },
  {
    holds: (digits) => digits.length >= CARD_LENGTH.MIN && digits.length <= CARD_LENGTH.MAX,
    reason: () => ERRORS.LENGTH_RANGE,
  },
  { holds: (digits) => !/^0+$/.test(digits), reason: () => ERRORS.ALL_ZEROS },
  { holds: hasNetworkLength, reason: (digits) => MESSAGES.networkLength(getCardType(digits)) },
  { holds: isValidLuhn, reason: () => ERRORS.LUHN_FAILED },
];

/**
 * Validates a credit card number: sanitises the input, applies the structural
 * rules, then the Luhn checksum, and names the network on success.
 */
export const validateCard = (cardNumber: string): ValidationResponse => {
  // Accept the spaces and dashes people paste from a physical card.
  const digits = cardNumber.replace(/[\s-]/g, '');
  const failed = RULES.find((rule) => !rule.holds(digits));

  if (failed) return { valid: false, error: failed.reason(digits) };
  return { valid: true, cardType: getCardType(digits) };
};
