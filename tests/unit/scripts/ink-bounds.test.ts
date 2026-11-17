import { describe, expect, it } from 'vitest';
import { inkBounds, padRect } from '../../../scripts/brand/ink-bounds.mjs';

/** A grey image of `width` x `height` pixels, white, with the given dark rectangles painted on it. */
function page(width: number, height: number, ink: { x: number; y: number; w: number; h: number; value?: number }[]) {
  const grey = new Uint8Array(width * height).fill(255);
  for (const { x, y, w, h, value = 0 } of ink) {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) grey[row * width + col] = value;
  }
  return grey;
}

describe('inkBounds', () => {
  it('finds the smallest rectangle around all the drawing', () => {
    const grey = page(100, 80, [
      { x: 20, y: 10, w: 5, h: 5 },
      { x: 60, y: 50, w: 10, h: 4 },
    ]);
    expect(inkBounds(grey, 100, 80)).toEqual({ left: 20, top: 10, width: 50, height: 44 });
  });

  it('finds a single dark pixel', () => {
    expect(inkBounds(page(10, 10, [{ x: 3, y: 7, w: 1, h: 1 }]), 10, 10)).toEqual({
      left: 3,
      top: 7,
      width: 1,
      height: 1,
    });
  });

  it('returns null for an empty page', () => {
    expect(inkBounds(page(10, 10, []), 10, 10)).toBeNull();
  });

  it('ignores pixels lighter than the threshold and counts the ones darker', () => {
    const grey = page(10, 10, [
      { x: 1, y: 1, w: 2, h: 2, value: 210 },
      { x: 5, y: 5, w: 2, h: 2, value: 150 },
    ]);
    expect(inkBounds(grey, 10, 10, { threshold: 200 })).toEqual({ left: 5, top: 5, width: 2, height: 2 });
    expect(inkBounds(grey, 10, 10, { threshold: 220 })).toEqual({ left: 1, top: 1, width: 6, height: 6 });
  });

  it('searches only the region it is given, and returns null for a region with nothing in it', () => {
    const grey = page(100, 100, [
      { x: 10, y: 10, w: 10, h: 10 },
      { x: 70, y: 70, w: 10, h: 10 },
    ]);
    expect(inkBounds(grey, 100, 100, { region: { left: 0, top: 0, width: 50, height: 50 } })).toEqual({
      left: 10,
      top: 10,
      width: 10,
      height: 10,
    });
    expect(inkBounds(grey, 100, 100, { region: { left: 30, top: 30, width: 20, height: 20 } })).toBeNull();
  });

  it('keeps a region that runs past the page inside the page', () => {
    const grey = page(20, 20, [{ x: 15, y: 15, w: 5, h: 5 }]);
    expect(inkBounds(grey, 20, 20, { region: { left: 10, top: 10, width: 100, height: 100 } })).toEqual({
      left: 15,
      top: 15,
      width: 5,
      height: 5,
    });
  });
});

describe('padRect', () => {
  it('grows the rectangle by the margin on every side', () => {
    expect(padRect({ left: 20, top: 30, width: 10, height: 10 }, 5, 100, 100)).toEqual({
      left: 15,
      top: 25,
      width: 20,
      height: 20,
    });
  });

  it('stops at the edges of the page', () => {
    expect(padRect({ left: 2, top: 1, width: 95, height: 98 }, 10, 100, 100)).toEqual({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });
  });
});
