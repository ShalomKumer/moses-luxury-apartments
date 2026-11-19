import { describe, expect, it } from 'vitest';
import { containedArea, isInsideArea } from '@domain/gallery/photo-area';

describe('the area a photo covers inside its box', () => {
  it('centres a wide photo with bars above and below', () => {
    // a 2:1 photo in a 400 x 400 box covers 400 x 200, from y = 100
    expect(containedArea(400, 400, 1000, 500)).toEqual({ x: 0, y: 100, width: 400, height: 200 });
  });

  it('centres a tall photo with bars at the sides', () => {
    expect(containedArea(400, 400, 500, 1000)).toEqual({ x: 100, y: 0, width: 200, height: 400 });
  });

  it('scales a small photo up to fit, never past the box', () => {
    expect(containedArea(800, 400, 100, 100)).toEqual({ x: 200, y: 0, width: 400, height: 400 });
  });

  it('covers the whole box when the photo fits it exactly', () => {
    expect(containedArea(300, 200, 600, 400)).toEqual({ x: 0, y: 0, width: 300, height: 200 });
  });

  it('takes the photo to cover the whole box while its size is unknown or the numbers are odd', () => {
    const whole = { x: 0, y: 0, width: 300, height: 200 };
    expect(containedArea(300, 200, 0, 0)).toEqual(whole);
    expect(containedArea(300, 200, Number.NaN, 400)).toEqual(whole);
    expect(containedArea(300, 200, 600, -1)).toEqual(whole);
    expect(containedArea(-5, 200, 600, 400)).toEqual({ x: 0, y: 0, width: 0, height: 200 });
  });

  it('says whether a point is on the photo, the edges counting, and a point on a bar is not', () => {
    const area = containedArea(400, 400, 1000, 500);
    expect(isInsideArea(area, 200, 200)).toBe(true);
    expect(isInsideArea(area, 0, 100)).toBe(true);
    expect(isInsideArea(area, 400, 300)).toBe(true);
    expect(isInsideArea(area, 200, 99)).toBe(false);
    expect(isInsideArea(area, 200, 301)).toBe(false);
    expect(isInsideArea(area, -1, 200)).toBe(false);
  });
});
