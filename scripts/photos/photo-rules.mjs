// What makes a picture file acceptable in the repo (C3, L8). Pure: the file's bytes are handed in.
import { MAX_BYTES } from './limits.mjs';
import { webpChunks } from './webp-chunks.mjs';

/** Raster formats that only ever arrive through the photo script, which writes WebP. */
const RASTER = /\.(?:jpe?g|png|gif|avif|heic|heif|tiff?|bmp)$/i;

/** Chunks of a WebP file that carry the camera's data, GPS position included. */
const METADATA_CHUNKS = ['EXIF', 'XMP '];

/** The owner's logo is not a photo: it is checked for its rights, not through the script. */
const EXEMPT = /^public\/brand\//;

/**
 * What is wrong with one file, as plain sentences (an empty list means fine).
 * @param {string} path project-relative, with forward slashes
 * @param {() => Uint8Array} read gives the file's bytes; called only for a WebP
 * @returns {string[]}
 */
export function photoProblems(path, read) {
  if (EXEMPT.test(path)) return [];
  if (RASTER.test(path))
    return ['a picture that did not come through "npm run photos:add" (it may carry EXIF and GPS)'];
  if (!/\.webp$/i.test(path)) return [];

  const bytes = read();
  const chunks = webpChunks(bytes);
  if (chunks === null) return ['is not a valid WebP file'];
  const problems = [];
  if (chunks.some((chunk) => METADATA_CHUNKS.includes(chunk))) {
    problems.push('carries camera metadata (EXIF or XMP, possibly a GPS position)');
  }
  if (bytes.length > MAX_BYTES)
    problems.push(`weighs ${Math.round(bytes.length / 1024)} KB, over the ${MAX_BYTES / 1000} KB ceiling`);
  return problems;
}
