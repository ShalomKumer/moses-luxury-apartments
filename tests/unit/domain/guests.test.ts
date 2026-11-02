import { describe, expect, it } from 'vitest';
import { clampGuests, maxGuestsOf } from '../../../src/domain/booking/guests';

describe('maxGuestsOf', () => {
  it('takes the largest capacity', () => {
    expect(maxGuestsOf([2, 6, 4])).toBe(6);
  });

  it('offers at least one guest when there are no apartments', () => {
    expect(maxGuestsOf([])).toBe(1);
  });
});

describe('clampGuests', () => {
  it('keeps a number within the capacity', () => {
    expect(clampGuests(2, 4)).toBe(2);
    expect(clampGuests(4, 4)).toBe(4);
  });

  it('resets a number above the capacity to not chosen', () => {
    expect(clampGuests(5, 4)).toBeNull();
  });

  it('keeps not chosen as it is, and treats zero, negative or fractional numbers as not chosen', () => {
    for (const value of [null, 0, -1, 1.5, Number.NaN]) expect(clampGuests(value, 4)).toBeNull();
  });
});
