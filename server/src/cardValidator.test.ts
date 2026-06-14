import { describe, it, expect } from 'vitest';
import { validateCard } from './cardValidator.js';
import { cardOfLength } from './test/cardFactory.js';

describe('validateCard', () => {
  it('accepts valid numbers and detects the network', () => {
    expect(validateCard('4532015112830366')).toEqual({ valid: true, cardType: 'Visa' });
    expect(validateCard('5425233430109903')).toEqual({ valid: true, cardType: 'Mastercard' });
    expect(validateCard('2223003122003222')).toEqual({ valid: true, cardType: 'Mastercard' });
    expect(validateCard('374245455400126')).toEqual({ valid: true, cardType: 'Amex' });
    expect(validateCard('6011514433546201')).toEqual({ valid: true, cardType: 'Discover' });
  });

  it('ignores spaces and dashes', () => {
    expect(validateCard('4532 0151 1283 0366').valid).toBe(true);
    expect(validateCard('4532-0151-1283-0366').valid).toBe(true);
  });

  it('rejects non-numeric, out-of-range, all-zero, and Luhn-failing numbers', () => {
    expect(validateCard('abc').valid).toBe(false);
    expect(validateCard('123').valid).toBe(false);
    expect(validateCard('12345678901234567890').valid).toBe(false);
    expect(validateCard('0000000000000000').valid).toBe(false);
    expect(validateCard('4532015112830367').valid).toBe(false);
  });

  it('rejects an all-zero number even though it satisfies the checksum', () => {
    // The Luhn sum of sixteen zeros is zero, a multiple of ten. Only the
    // structural rule catches it.
    expect(validateCard('0'.repeat(16))).toEqual({
      valid: false,
      error: 'Card number cannot be all zeros.',
    });
  });

  it('rejects a number whose length its own network never issues', () => {
    // 16 digits, prefix 37, checksum correct — and still not an Amex card.
    const result = validateCard(cardOfLength('37', 16));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not valid for Amex/);
  });

  it('accepts the shorter and longer lengths Visa still issues', () => {
    expect(validateCard(cardOfLength('4', 13))).toEqual({ valid: true, cardType: 'Visa' });
    expect(validateCard(cardOfLength('4', 19))).toEqual({ valid: true, cardType: 'Visa' });
  });

  it('applies no length rule to an unrecognised network', () => {
    expect(validateCard(cardOfLength('9', 17))).toEqual({ valid: true, cardType: 'Unknown' });
  });

  it('explains why a number is rejected', () => {
    expect(validateCard('abc').error).toMatch(/digits/); // names the digits rule
    expect(validateCard('123').error).toMatch(/13-19/); // names the length range
    expect(validateCard('4532015112830367').error).toMatch(/Luhn/); // names the Luhn rule
  });
});
