import type { CardType } from '@ccv/shared';

/** A network's issuer-identifier rule plus the digit counts it may be issued at. */
interface Network {
  readonly type: CardType;
  readonly matches: (digits: string) => boolean;
  readonly lengths: readonly number[];
}

/** Reads the leading `size` digits as a number, for range comparisons. */
const leading = (digits: string, size: number): number => Number(digits.slice(0, size));

const inRange = (value: number, min: number, max: number): boolean => value >= min && value <= max;

/**
 * Issuer identification numbers per ISO/IEC 7812, evaluated top to bottom.
 *
 * A table rather than an `if` chain: each network's prefix rule and its legal
 * lengths sit on one row, so adding a network cannot leave a length rule
 * stranded in some other switch. Prefixes are disjoint, so order is not
 * load-bearing.
 */
const NETWORKS: readonly Network[] = [
  {
    type: 'Visa',
    matches: (digits) => digits.startsWith('4'),
    lengths: [13, 16, 19],
  },
  {
    type: 'Mastercard',
    // Legacy 51-55, plus the 2-series 2221-2720 opened in 2017.
    matches: (digits) =>
      inRange(leading(digits, 2), 51, 55) || inRange(leading(digits, 4), 2221, 2720),
    lengths: [16],
  },
  {
    type: 'Amex',
    matches: (digits) => leading(digits, 2) === 34 || leading(digits, 2) === 37,
    lengths: [15],
  },
  {
    type: 'Discover',
    // 6011, the 644-649 block, 65, and the 622126-622925 UnionPay co-brand range.
    matches: (digits) =>
      digits.startsWith('6011') ||
      leading(digits, 2) === 65 ||
      inRange(leading(digits, 3), 644, 649) ||
      inRange(leading(digits, 6), 622126, 622925),
    lengths: [16, 19],
  },
];

const findNetwork = (digits: string): Network | undefined =>
  NETWORKS.find((network) => network.matches(digits));

/** Detects the issuing network of a digits-only card number from its prefix. */
export const getCardType = (digits: string): CardType => findNetwork(digits)?.type ?? 'Unknown';

/**
 * True when the digit count is one the detected network actually issues — a
 * 16-digit number beginning 37 passes Luhn happily but is not an Amex card.
 * Unknown networks publish no length rule, so they are left alone.
 */
export const hasNetworkLength = (digits: string): boolean => {
  const network = findNetwork(digits);
  return !network || network.lengths.includes(digits.length);
};
