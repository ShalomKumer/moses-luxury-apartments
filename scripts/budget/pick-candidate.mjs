// Which file of a `srcset` a phone loads, for the weight check. Pure.

/** A phone 375 px wide at twice the pixel density: the picture it asks for is 750 px wide. */
export const PHONE_PICTURE_WIDTH = 750;

/**
 * The file of a `srcset` (`file 640w, file 1280w`) that a phone loads: the smallest that is at least as wide as the
 * phone needs, or the largest when none is. `sizes` is not read: a photo on a phone is nearly as wide as the screen, so
 * the answer is the same, and a ceiling that assumes the larger file only errs on the heavy side. Returns null when the
 * `srcset` names no file with a width.
 * @param {string} srcset
 * @param {number} [needed]
 * @returns {string | null}
 */
export function pickCandidate(srcset, needed = PHONE_PICTURE_WIDTH) {
  const candidates = srcset
    .split(',')
    .map((part) => part.trim().split(/\s+/))
    .filter(([url, descriptor]) => url && /^\d+w$/.test(descriptor ?? ''))
    .map(([url, descriptor]) => ({ url, width: Number.parseInt(descriptor, 10) }))
    .sort((a, b) => a.width - b.width);
  if (candidates.length === 0) return null;
  return (candidates.find((candidate) => candidate.width >= needed) ?? candidates[candidates.length - 1]).url;
}
