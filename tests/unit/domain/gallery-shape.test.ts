import { describe, expect, it } from 'vitest';
import { galleryShape, MAX_GRID_PHOTOS } from '../../../src/domain/gallery/gallery-shape';

describe('galleryShape', () => {
  it('shows one photo alone, with no viewer controls', () => {
    expect(galleryShape(1)).toEqual({ shown: 1, more: 0, hasViewerControls: false });
  });

  it('shows every photo up to five in the grid', () => {
    for (const count of [2, 3, 4, 5]) {
      expect(galleryShape(count)).toEqual({ shown: count, more: 0, hasViewerControls: true });
    }
  });

  it('leaves the photos beyond the fifth to the viewer', () => {
    expect(galleryShape(8)).toEqual({ shown: MAX_GRID_PHOTOS, more: 3, hasViewerControls: true });
  });

  it('handles no photos, a negative, a fraction and a number that is not finite', () => {
    expect(galleryShape(0)).toEqual({ shown: 0, more: 0, hasViewerControls: false });
    expect(galleryShape(-3)).toEqual({ shown: 0, more: 0, hasViewerControls: false });
    expect(galleryShape(2.9)).toEqual({ shown: 2, more: 0, hasViewerControls: true });
    expect(galleryShape(Number.NaN)).toEqual({ shown: 0, more: 0, hasViewerControls: false });
    expect(galleryShape(Number.POSITIVE_INFINITY)).toEqual({ shown: 0, more: 0, hasViewerControls: false });
  });
});
