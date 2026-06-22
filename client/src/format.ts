import { UI } from './constants';

// Matches every group of N digits so a space can be inserted after each block.
const GROUP_PATTERN = new RegExp(`(.{${UI.DIGIT_GROUP_SIZE}})`, 'g');

/** Keeps digits only, capped at the longest length any network issues. */
export const toDigits = (value: string): string =>
  value.replace(/\D/g, '').slice(0, UI.MAX_CARD_DIGITS);

/** Groups a card number into blocks of four digits for display while typing. */
export const formatCardNumber = (value: string): string =>
  toDigits(value).replace(GROUP_PATTERN, '$1 ').trim();
