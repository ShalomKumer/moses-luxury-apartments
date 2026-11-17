// Decides which widths to make from a source photo. Pure: no files, no sharp.
import { WIDTHS } from './limits.mjs';

/**
 * The widths to produce for a source of the given width: every standard width the source can fill, never an enlarged
 * one. A source narrower than the smallest standard width is kept at its own width, so it is never dropped.
 * @param {number} sourceWidth width in pixels, after any rotation
 * @returns {number[]}
 */
export function planWidths(sourceWidth) {
  if (!Number.isInteger(sourceWidth) || sourceWidth < 1) {
    throw new Error(`The photo has no usable width (${sourceWidth}).`);
  }
  const fitting = WIDTHS.filter((width) => width <= sourceWidth);
  return fitting.length > 0 ? fitting : [sourceWidth];
}
