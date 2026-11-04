import { describe, expect, it } from 'vitest';
import { nextApartments } from '@domain/apartments/next-apartments';

const list = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id }));
const ids = (items: { id: string }[]) => items.map((item) => item.id);

describe('nextApartments', () => {
  it('returns the ones that follow the current apartment', () => {
    expect(ids(nextApartments(list, 'b', 2))).toEqual(['c', 'd']);
  });

  it('wraps back to the start of the list', () => {
    expect(ids(nextApartments(list, 'd', 3))).toEqual(['e', 'a', 'b']);
    expect(ids(nextApartments(list, 'e', 3))).toEqual(['a', 'b', 'c']);
  });

  it('never returns the apartment itself, even when the list is short', () => {
    expect(ids(nextApartments(list, 'c', 10))).toEqual(['d', 'e', 'a', 'b']);
    expect(ids(nextApartments([{ id: 'a' }, { id: 'b' }], 'a', 3))).toEqual(['b']);
  });

  it('returns nothing for an empty list, a single apartment or a count below one', () => {
    expect(nextApartments([], 'a', 3)).toEqual([]);
    expect(nextApartments([{ id: 'a' }], 'a', 3)).toEqual([]);
    expect(nextApartments(list, 'a', 0)).toEqual([]);
    expect(nextApartments(list, 'a', -1)).toEqual([]);
    expect(nextApartments(list, 'a', 1.5)).toEqual([]);
  });

  it('gives the first ones when the id is not in the list', () => {
    expect(ids(nextApartments(list, 'missing', 3))).toEqual(['a', 'b', 'c']);
  });

  it('does not change the list it is given', () => {
    const copy = [...list];
    nextApartments(list, 'c', 3);
    expect(list).toEqual(copy);
  });

  it('keeps the whole item, not only its id', () => {
    const rich = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];
    expect(nextApartments(rich, 'a', 1)).toEqual([{ id: 'b', name: 'B' }]);
  });
});
