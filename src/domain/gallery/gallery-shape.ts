/** The most photos the grid shows at once: one large and four small. The rest are reached through the viewer. */
export const MAX_GRID_PHOTOS = 5;

/** How the gallery grid is arranged for a number of photos. */
export interface GalleryShape {
  /** How many photos the grid shows; always at least 1 for a gallery that has any. */
  shown: number;
  /** How many photos only the viewer reaches ("all photos"). */
  more: number;
  /** Whether the "all photos" button and the viewer's arrows are needed: only with more than one photo. */
  hasViewerControls: boolean;
}

/**
 * Chooses the grid for `count` photos: 1 is one photo, 2 is two halves, 3 to 5 are one large photo and the rest small.
 * Photos beyond the fifth are not drawn in the grid. A negative or fractional count is treated as the whole number
 * below it, never as a crash.
 */
export function galleryShape(count: number): GalleryShape {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const shown = Math.min(total, MAX_GRID_PHOTOS);
  return { shown, more: total - shown, hasViewerControls: total > 1 };
}
