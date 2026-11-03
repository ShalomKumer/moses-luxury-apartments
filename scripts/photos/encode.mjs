// Turns a source photo into WebP files: turned upright by its EXIF, resized, and carrying no metadata at all.
import sharp from 'sharp';
import { MAX_BYTES, QUALITIES, VIEWER_WIDTH } from './limits.mjs';
import { planWidths } from './plan-variants.mjs';

/**
 * Reads the width the photo will have once turned upright (a phone photo is often stored sideways).
 * @param {Buffer} source
 * @returns {Promise<number>}
 */
async function uprightWidth(source) {
  const { width, height, orientation } = await sharp(source).metadata();
  const sideways = orientation !== undefined && orientation >= 5;
  return sideways ? height : width;
}

/**
 * One width as WebP, at the best quality that still fits under the size ceiling. sharp keeps no EXIF, GPS or XMP
 * unless asked to, and it is never asked to: the photo's metadata is dropped here (L8).
 * @param {Buffer} source
 * @param {number} width
 * @param {number} maxBytes
 * @returns {Promise<{ width: number, quality: number, data: Buffer }>}
 */
async function encodeWidth(source, width, maxBytes) {
  for (const quality of QUALITIES) {
    const data = await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toBuffer();
    if (data.length <= maxBytes) return { width, quality, data };
  }
  throw new Error(
    `The ${width}px version stays over ${maxBytes} bytes even at the lowest quality. Send a simpler photo.`,
  );
}

/**
 * Every standard width of a source photo.
 * @param {Buffer} source the file as read from disk
 * @param {number} [maxBytes] the size ceiling of one file; the standard one unless a test narrows it
 * @param {number} [pageMaxBytes] a lower ceiling for the files a page loads (every width below the viewer's), for a photo that
 *   sits in a row on other pages and would push them over the weight budget; the viewer's file keeps `maxBytes`
 * @returns {Promise<{ width: number, quality: number, data: Buffer }[]>}
 */
export async function encodePhoto(source, maxBytes = MAX_BYTES, pageMaxBytes = maxBytes) {
  const widths = planWidths(await uprightWidth(source));
  const ceilingOf = (width) => (width < VIEWER_WIDTH ? Math.min(pageMaxBytes, maxBytes) : maxBytes);
  return Promise.all(widths.map((width) => encodeWidth(source, width, ceilingOf(width))));
}
