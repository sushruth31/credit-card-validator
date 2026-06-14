import { describe, it, expect } from 'vitest';
import { getCardType, hasNetworkLength } from './cardType.js';
import { cardOfLength } from './test/cardFactory.js';

/** Builds a 16-digit number starting with the given issuer prefix. */
const withPrefix = (prefix: string): string => cardOfLength(prefix, 16);

describe('getCardType', () => {
  it('detects each supported network from its issuer prefix', () => {
    expect(getCardType(withPrefix('4'))).toBe('Visa');
    expect(getCardType(withPrefix('51'))).toBe('Mastercard');
    expect(getCardType(cardOfLength('34', 15))).toBe('Amex');
    expect(getCardType(withPrefix('6011'))).toBe('Discover');
  });

  it('honours both ends of the Mastercard 2-series range', () => {
    // The 2-series is 2221-2720. One digit outside either end is not Mastercard.
    expect(getCardType(withPrefix('2220'))).toBe('Unknown');
    expect(getCardType(withPrefix('2221'))).toBe('Mastercard');
    expect(getCardType(withPrefix('2720'))).toBe('Mastercard');
    expect(getCardType(withPrefix('2721'))).toBe('Unknown');
  });

  it('honours both ends of the legacy 51-55 Mastercard range', () => {
    expect(getCardType(withPrefix('50'))).toBe('Unknown');
    expect(getCardType(withPrefix('55'))).toBe('Mastercard');
    expect(getCardType(withPrefix('56'))).toBe('Unknown');
  });

  it('separates Amex 34/37 from the neighbouring 35 and 36 issuers', () => {
    expect(getCardType(cardOfLength('37', 15))).toBe('Amex');
    // 35 is JCB and 36 is Diners Club — neither is claimed here.
    expect(getCardType(cardOfLength('35', 16))).toBe('Unknown');
    expect(getCardType(cardOfLength('36', 16))).toBe('Unknown');
  });

  it('recognises every published Discover block and nothing adjacent', () => {
    expect(getCardType(withPrefix('6011'))).toBe('Discover');
    expect(getCardType(withPrefix('65'))).toBe('Discover');
    expect(getCardType(withPrefix('644'))).toBe('Discover');
    expect(getCardType(withPrefix('649'))).toBe('Discover');
    expect(getCardType(withPrefix('622126'))).toBe('Discover');
    expect(getCardType(withPrefix('622925'))).toBe('Discover');
    // Just outside each block.
    expect(getCardType(withPrefix('6012'))).toBe('Unknown');
    expect(getCardType(withPrefix('643'))).toBe('Unknown');
    expect(getCardType(withPrefix('622125'))).toBe('Unknown');
  });

  it('returns Unknown rather than guessing at an unassigned prefix', () => {
    expect(getCardType(withPrefix('9'))).toBe('Unknown');
    expect(getCardType(withPrefix('1'))).toBe('Unknown');
  });
});

describe('hasNetworkLength', () => {
  it('accepts all three lengths Visa issues at', () => {
    expect([13, 16, 19].map((n) => hasNetworkLength(cardOfLength('4', n)))).toEqual([
      true,
      true,
      true,
    ]);
    expect(hasNetworkLength(cardOfLength('4', 15))).toBe(false);
  });

  it('requires exactly 15 digits for Amex and 16 for Mastercard', () => {
    expect(hasNetworkLength(cardOfLength('37', 15))).toBe(true);
    expect(hasNetworkLength(cardOfLength('37', 16))).toBe(false);
    expect(hasNetworkLength(cardOfLength('51', 16))).toBe(true);
    expect(hasNetworkLength(cardOfLength('51', 19))).toBe(false);
  });

  it('leaves unknown networks alone, since they publish no length rule', () => {
    expect([13, 17, 19].map((n) => hasNetworkLength(cardOfLength('9', n)))).toEqual([
      true,
      true,
      true,
    ]);
  });
});
