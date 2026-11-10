import { describe, expect, it } from 'vitest';
import { maxGuestsOf } from '../../../src/domain/booking/guests';

describe('maxGuestsOf', () => {
  it('takes the largest capacity', () => {
    expect(maxGuestsOf([2, 6, 4])).toBe(6);
  });

  it('offers at least one guest when there are no apartments', () => {
    expect(maxGuestsOf([])).toBe(1);
  });
});
