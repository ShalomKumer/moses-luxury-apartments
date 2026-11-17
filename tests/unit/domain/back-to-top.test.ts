import { describe, expect, it } from 'vitest';
import { SHOW_AFTER_SCREENS, showBackToTop } from '@domain/scroll/back-to-top';

describe('showBackToTop', () => {
  it('stays hidden until the page is scrolled more than a screen and a half', () => {
    expect(showBackToTop(0, 800)).toBe(false);
    expect(showBackToTop(800, 800)).toBe(false);
    expect(showBackToTop(1200, 800)).toBe(false);
    expect(showBackToTop(1201, 800)).toBe(true);
    expect(showBackToTop(5000, 800)).toBe(true);
  });

  it('follows the height of the window, so a phone and a desktop both count in screens', () => {
    expect(showBackToTop(1000, 600)).toBe(true);
    expect(showBackToTop(1000, 700)).toBe(false);
  });

  it("never shows for a negative scroll (a phone's rubber-band at the top)", () => {
    expect(showBackToTop(-50, 800)).toBe(false);
  });

  it('never shows for a window with no height, or numbers that are not numbers', () => {
    expect(showBackToTop(2000, 0)).toBe(false);
    expect(showBackToTop(2000, -10)).toBe(false);
    expect(showBackToTop(Number.NaN, 800)).toBe(false);
    expect(showBackToTop(2000, Number.NaN)).toBe(false);
  });

  it('takes another number of screens when asked, and keeps the default in one place', () => {
    expect(SHOW_AFTER_SCREENS).toBe(1.5);
    expect(showBackToTop(900, 800, 1)).toBe(true);
    expect(showBackToTop(900, 800, 2)).toBe(false);
  });
});
