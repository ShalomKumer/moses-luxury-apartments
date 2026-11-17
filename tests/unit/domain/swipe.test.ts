import { describe, expect, it } from 'vitest';
import { MIN_SWIPE_PX, swipeDirection } from '@domain/gallery/swipe';

describe('swipeDirection', () => {
  it('goes to the next photo when the finger moves left in a left-to-right page, and back when it moves right', () => {
    expect(swipeDirection(-120, 5, false)).toBe('next');
    expect(swipeDirection(120, -5, false)).toBe('previous');
  });

  it('is the other way round in a right-to-left page', () => {
    expect(swipeDirection(120, 5, true)).toBe('next');
    expect(swipeDirection(-120, 5, true)).toBe('previous');
  });

  it('ignores a movement shorter than the minimum, a tap included', () => {
    expect(swipeDirection(0, 0, false)).toBeNull();
    expect(swipeDirection(-(MIN_SWIPE_PX - 1), 0, false)).toBeNull();
    expect(swipeDirection(MIN_SWIPE_PX - 1, 0, true)).toBeNull();
    expect(swipeDirection(-MIN_SWIPE_PX, 0, false)).toBe('next');
  });

  it('ignores a movement that is more up or down than sideways, or exactly diagonal', () => {
    expect(swipeDirection(-60, 120, false)).toBeNull();
    expect(swipeDirection(60, -90, true)).toBeNull();
    expect(swipeDirection(-80, 80, false)).toBeNull();
    expect(swipeDirection(-80, 79, false)).toBe('next');
  });

  it('takes another minimum when asked', () => {
    expect(swipeDirection(-20, 0, false, 10)).toBe('next');
    expect(swipeDirection(-20, 0, false, 30)).toBeNull();
  });

  it('ignores numbers that are not numbers', () => {
    expect(swipeDirection(Number.NaN, 0, false)).toBeNull();
    expect(swipeDirection(-100, Number.NaN, false)).toBeNull();
    expect(swipeDirection(Number.POSITIVE_INFINITY, 0, false)).toBeNull();
  });
});
