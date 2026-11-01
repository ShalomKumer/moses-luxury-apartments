// Where a produced photo is written, and which names are allowed. Pure.
import { PHOTOS_DIR } from './limits.mjs';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The path of one produced file, e.g. public/photos/gefen/living-room-1280.webp.
 * The apartment and the photo name are lower-case words joined by hyphens, so a name can never climb out of the folder.
 * @param {string} apartment
 * @param {string} name
 * @param {number} width
 * @returns {string}
 */
export function outputPath(apartment, name, width) {
  for (const [label, value] of [
    ['apartment', apartment],
    ['photo name', name],
  ]) {
    if (!SLUG.test(value ?? '')) {
      throw new Error(`The ${label} must be lower-case English words joined by hyphens (got "${value ?? ''}").`);
    }
  }
  return `${PHOTOS_DIR}/${apartment}/${name}-${width}.webp`;
}
