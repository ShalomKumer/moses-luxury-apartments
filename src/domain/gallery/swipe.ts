/**
 * What a finger's movement across the photo viewer means: to the next photo, to the previous one, or nothing. Pure: the
 * controller measures the movement and only asks this.
 */

/** The shortest sideways movement that counts as a swipe, in pixels (a tap or a small wobble never moves a photo). */
export const MIN_SWIPE_PX = 40;

export type SwipeResult = 'next' | 'previous' | null;

/**
 * Reads a movement of `dx` pixels sideways (positive = to the right) and `dy` pixels down. It counts only when it is at
 * least `min` pixels long and more sideways than vertical, so scrolling a caption or a slanted touch does not turn the page.
 * The page's direction decides which way is forward: in a left-to-right page the finger moves left to go to the next photo
 * (as a page of a book is turned), in a right-to-left page it moves right.
 */
export function swipeDirection(dx: number, dy: number, rtl: boolean, min: number = MIN_SWIPE_PX): SwipeResult {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (Math.abs(dx) < min || Math.abs(dx) <= Math.abs(dy)) return null;
  const towardsNext = rtl ? dx > 0 : dx < 0;
  return towardsNext ? 'next' : 'previous';
}
