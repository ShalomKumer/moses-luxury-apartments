/**
 * When the "back to top" button shows: once the visitor has scrolled down more than this many screens, so a short page
 * and the first screens of a long one stay clean. Pure: the script that listens to the scroll only asks this.
 */
export const SHOW_AFTER_SCREENS = 1.5;

/**
 * Whether the button shows. `scrollY` is how far the page is scrolled and `viewportHeight` the height of the window, in
 * pixels. A window of no height (a page not yet laid out) and a negative scroll (a phone's rubber-band at the top) never show it.
 */
export function showBackToTop(scrollY: number, viewportHeight: number, screens: number = SHOW_AFTER_SCREENS): boolean {
  if (!(viewportHeight > 0) || !(scrollY > 0)) return false;
  return scrollY > viewportHeight * screens;
}
