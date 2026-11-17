// Finds where the drawing is on a page of white paper: the smallest rectangle that holds every dark-enough pixel.
// Pure (no files): the logo script and its test both use it.

/**
 * The smallest rectangle (left, top, width, height) that holds every pixel darker than `threshold`, from a grey image
 * of `width` x `height` pixels (one byte per pixel, 0 = black, 255 = white). `region` limits the search to a part of the
 * page. Returns null when nothing in the region is dark (an empty page or an empty region).
 * @param {Uint8Array} grey
 * @param {number} width
 * @param {number} height
 * @param {{ threshold?: number, region?: { left: number, top: number, width: number, height: number } }} [options]
 * @returns {{ left: number, top: number, width: number, height: number } | null}
 */
export function inkBounds(grey, width, height, { threshold = 200, region } = {}) {
  const left = Math.max(0, region?.left ?? 0);
  const top = Math.max(0, region?.top ?? 0);
  const right = Math.min(width, left + (region?.width ?? width));
  const bottom = Math.min(height, top + (region?.height ?? height));
  let minX = right;
  let maxX = -1;
  let minY = bottom;
  let maxY = -1;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (grey[y * width + x] >= threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Grows a rectangle by `margin` pixels on every side, kept inside a page of `width` x `height` pixels. */
export function padRect(rect, margin, width, height) {
  const left = Math.max(0, rect.left - margin);
  const top = Math.max(0, rect.top - margin);
  const right = Math.min(width, rect.left + rect.width + margin);
  const bottom = Math.min(height, rect.top + rect.height + margin);
  return { left, top, width: right - left, height: bottom - top };
}
