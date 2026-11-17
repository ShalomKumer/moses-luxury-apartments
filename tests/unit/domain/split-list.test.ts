import { describe, expect, it } from 'vitest';
import { splitList } from '@domain/apartments/split-list';

const list = ['a', 'b', 'c', 'd', 'e'];

describe('splitList', () => {
  it('shows the first ones and keeps the rest in their order', () => {
    expect(splitList(list, 3)).toEqual({ shown: ['a', 'b', 'c'], rest: ['d', 'e'] });
  });

  it('leaves nothing to fold when the list is not longer than the number shown', () => {
    expect(splitList(list, 5)).toEqual({ shown: list, rest: [] });
    expect(splitList(list, 9)).toEqual({ shown: list, rest: [] });
    expect(splitList([], 3)).toEqual({ shown: [], rest: [] });
  });

  it('folds a single apartment when the list is one longer than the number shown', () => {
    expect(splitList(['a', 'b'], 1)).toEqual({ shown: ['a'], rest: ['b'] });
  });

  it('shows everything for a number below one or not whole, rather than hiding the list', () => {
    expect(splitList(list, 0)).toEqual({ shown: list, rest: [] });
    expect(splitList(list, -2)).toEqual({ shown: list, rest: [] });
    expect(splitList(list, 1.5)).toEqual({ shown: list, rest: [] });
    expect(splitList(list, Number.NaN)).toEqual({ shown: list, rest: [] });
  });

  it('does not change the list it is given', () => {
    const input = ['a', 'b', 'c'];
    splitList(input, 1);
    expect(input).toEqual(['a', 'b', 'c']);
  });
});
