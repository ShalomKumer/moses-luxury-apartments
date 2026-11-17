import { describe, expect, it } from 'vitest';
import {
  clampCount,
  COUPLE_SIZE,
  limitParty,
  maxChildren,
  maxCouples,
  parseCount,
  totalOf,
  typedTotal,
} from '@domain/booking/party';

describe('totalOf', () => {
  it('counts two people for each couple and one for each child', () => {
    expect(COUPLE_SIZE).toBe(2);
    expect(totalOf(1, 0)).toBe(2);
    expect(totalOf(2, 3)).toBe(7);
    expect(totalOf(0, 4)).toBe(4);
    expect(totalOf(0, 0)).toBe(0);
  });
});

describe('parseCount', () => {
  it('reads the digits of what was typed', () => {
    expect(parseCount('7')).toBe(7);
    expect(parseCount('007')).toBe(7);
    expect(parseCount(' 12 ')).toBe(12);
  });

  it('is 0 for an empty field or text with no digits', () => {
    expect(parseCount('')).toBe(0);
    expect(parseCount('abc')).toBe(0);
    expect(parseCount('-')).toBe(0);
  });

  it('drops everything that is not a digit, a minus sign and a decimal point included', () => {
    expect(parseCount('-3')).toBe(3);
    expect(parseCount('2.5')).toBe(25);
    expect(parseCount('1,000')).toBe(100);
  });

  it('cuts a very long number to three digits', () => {
    expect(parseCount('123456789')).toBe(123);
  });
});

describe('clampCount', () => {
  it('keeps a count between 0 and the limit', () => {
    expect(clampCount(3, 5)).toBe(3);
    expect(clampCount(9, 5)).toBe(5);
    expect(clampCount(-2, 5)).toBe(0);
    expect(clampCount(2.9, 5)).toBe(2);
  });

  it('treats a limit below 0 as 0, and anything that is not a number as 0', () => {
    expect(clampCount(3, -1)).toBe(0);
    expect(clampCount(Number.NaN, 5)).toBe(0);
    expect(clampCount(Number.POSITIVE_INFINITY, 5)).toBe(0);
  });
});

describe('maxCouples and maxChildren', () => {
  it('takes the couples that fit, the half of an odd number rounded down', () => {
    expect(maxCouples(9)).toBe(4);
    expect(maxCouples(2)).toBe(2 / COUPLE_SIZE);
    expect(maxCouples(1)).toBe(0);
    expect(maxCouples(0)).toBe(0);
  });

  it('leaves the rest of the places to children', () => {
    expect(maxChildren(9, 0)).toBe(9);
    expect(maxChildren(9, 4)).toBe(1);
    expect(maxChildren(2, 1)).toBe(0);
    expect(maxChildren(2, 5)).toBe(0);
  });
});

describe('limitParty', () => {
  it('leaves a party that fits as it is', () => {
    expect(limitParty(2, 3, 9)).toEqual({ couples: 2, children: 3, lowered: false });
    expect(limitParty(0, 0, 2)).toEqual({ couples: 0, children: 0, lowered: false });
  });

  it('lowers the couples first, then the children to what is left, and says so', () => {
    expect(limitParty(6, 0, 9)).toEqual({ couples: 4, children: 0, lowered: true });
    expect(limitParty(4, 5, 9)).toEqual({ couples: 4, children: 1, lowered: true });
    expect(limitParty(1, 4, 2)).toEqual({ couples: 1, children: 0, lowered: true });
  });

  it('fits a suite for two: one couple and no children, or two children', () => {
    expect(limitParty(1, 0, 2)).toEqual({ couples: 1, children: 0, lowered: false });
    expect(limitParty(0, 2, 2)).toEqual({ couples: 0, children: 2, lowered: false });
    expect(limitParty(0, 3, 2)).toEqual({ couples: 0, children: 2, lowered: true });
  });

  it('never makes a number negative', () => {
    expect(limitParty(-1, -4, 9)).toEqual({ couples: 0, children: 0, lowered: false });
  });
});

describe('typedTotal', () => {
  it("reads a typed total within the apartment's guests", () => {
    expect(typedTotal('5', 9)).toBe(5);
    expect(typedTotal('9', 9)).toBe(9);
  });

  it('lowers a total that is too high to the limit', () => {
    expect(typedTotal('15', 9)).toBe(9);
  });

  it('is null (not chosen) for an empty field, text with no digits or 0', () => {
    expect(typedTotal('', 9)).toBeNull();
    expect(typedTotal('abc', 9)).toBeNull();
    expect(typedTotal('0', 9)).toBeNull();
  });
});
