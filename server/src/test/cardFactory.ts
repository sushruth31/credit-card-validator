/** Test-only helpers for building card numbers with a known checksum. */

export const DIGITS = '0123456789'.split('');

/**
 * Appends the Luhn check digit to a partial number, producing one that passes
 * the checksum. Derived independently of `isValidLuhn`, so the tests are not
 * merely restating the implementation back to itself.
 */
export const withCheckDigit = (prefix: string): string => {
  const sum = prefix
    .split('')
    .reverse()
    // The appended check digit takes the rightmost slot, so the last digit of
    // the prefix lands on a doubled position.
    .map((digit, index) => (index % 2 === 0 ? Number(digit) * 2 : Number(digit)))
    .reduce((total, value) => total + (value > 9 ? value - 9 : value), 0);
  return prefix + ((10 - (sum % 10)) % 10);
};

/** Pads an issuer prefix with zeros and a check digit to an exact digit count. */
export const cardOfLength = (prefix: string, length: number): string =>
  withCheckDigit(prefix + '0'.repeat(length - 1 - prefix.length));
