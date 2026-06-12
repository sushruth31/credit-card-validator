import { describe, it, expect } from 'vitest';
import { isValidLuhn } from './luhn.js';
import { DIGITS, withCheckDigit } from './test/cardFactory.js';

const VISA = '4532015112830366';

/** Swaps the digits at `index` and `index + 1`. */
const transpose = (card: string, index: number): string =>
  card.slice(0, index) + card[index + 1] + card[index] + card.slice(index + 2);

const positions = (card: string): number[] => card.split('').map((_, index) => index);

describe('isValidLuhn', () => {
  it('accepts real numbers of both even and odd length', () => {
    expect(isValidLuhn(VISA)).toBe(true);
    expect(isValidLuhn('374245455400126')).toBe(true); // 15 digits
    expect(isValidLuhn('6011514433546201')).toBe(true);
  });

  it('rejects a number whose check digit is off by one', () => {
    expect(isValidLuhn('4532015112830367')).toBe(false);
    expect(isValidLuhn('1234567890123456')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isValidLuhn('')).toBe(false);
  });

  it('never doubles the rightmost check digit', () => {
    // '18': the 8 is the check digit and stays; the 1 doubles to 2, summing 10.
    expect(isValidLuhn('18')).toBe(true);
    // '81': if the rightmost digit were doubled this would also pass. It must not.
    expect(isValidLuhn('81')).toBe(false);
  });

  it('subtracts nine from a doubled digit above nine', () => {
    // '67': 6 doubles to 12, folded to 3, plus the check digit 7 makes 10.
    // Without the fold the total would be 19 and this would be rejected.
    expect(isValidLuhn('67')).toBe(true);
  });

  it('counts parity from the right, so leading zeros do not change the result', () => {
    expect(isValidLuhn('18')).toBe(true);
    expect(isValidLuhn('018')).toBe(true);
    expect(isValidLuhn('0018')).toBe(true);
  });

  it('accepts an all-zero string, which is why the structural rules reject it separately', () => {
    // Sum zero is a multiple of ten. The checksum alone cannot reject '0000...'.
    expect(isValidLuhn('0'.repeat(16))).toBe(true);
  });

  it('accepts exactly one of the ten possible check digits for a given prefix', () => {
    const prefix = VISA.slice(0, -1);
    expect(withCheckDigit(prefix)).toBe(VISA);
    expect(DIGITS.filter((digit) => isValidLuhn(prefix + digit))).toEqual(['6']);
  });

  it('catches every single-digit substitution', () => {
    const typos = positions(VISA).flatMap((index) =>
      DIGITS.filter((digit) => digit !== VISA[index]).map(
        (digit) => VISA.slice(0, index) + digit + VISA.slice(index + 1),
      ),
    );
    expect(typos).toHaveLength(VISA.length * 9);
    expect(typos.filter(isValidLuhn)).toEqual([]);
  });

  it('catches every adjacent transposition except a 0/9 pair', () => {
    // Doubling maps 0 -> 0 and 9 -> 18 -> 9, so swapping a 0 with an adjacent 9
    // leaves the sum untouched. It is the algorithm's one documented blind spot.
    const missed = positions(VISA)
      .slice(0, -1)
      .filter((index) => VISA[index] !== VISA[index + 1] && isValidLuhn(transpose(VISA, index)));
    expect(missed).toEqual([]);

    const blindSpot = withCheckDigit('09');
    expect(isValidLuhn(blindSpot)).toBe(true);
    expect(isValidLuhn(transpose(blindSpot, 0))).toBe(true); // '90' passes too
  });
});
