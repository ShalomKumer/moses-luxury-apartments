// Reads the chunk names of a WebP file (RIFF container) without decoding the picture. Pure.

/**
 * The four-letter chunk names inside a WebP file, in order (e.g. VP8X, VP8, EXIF, XMP ).
 * Returns null when the bytes are not a well-formed WebP.
 * @param {Uint8Array} bytes
 * @returns {string[] | null}
 */
export function webpChunks(bytes) {
  const text = (start, end) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes.length < 12 || text(0, 4) !== 'RIFF' || text(8, 12) !== 'WEBP') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const names = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const size = view.getUint32(offset + 4, true);
    if (offset + 8 + size > bytes.length) return null; // a chunk that runs past the end of the file
    names.push(text(offset, offset + 4));
    offset += 8 + size + (size % 2); // chunks are padded to an even size
  }
  return names;
}
