/** The files one photo is shown from: the default one, every width as a `srcset`, and the largest one for the viewer. */
export interface PhotoSources {
  /** The file used where the browser cannot choose (and as the default of the `srcset`). */
  src: string;
  /** Every width of the photo, `file width`, smallest first; absent for a photo that has a single file (an SVG). */
  srcset?: string;
  /** The smallest file: what a small picture on a phone (an apartment's row) loads. */
  small: string;
  /** The largest file: what the viewer opens. */
  full: string;
}

/** The width in a file the photo script wrote: `living-room-1280.webp`. */
const WIDTH_SUFFIX = /-(\d+)\.webp$/;

/**
 * Works out the files of a photo from the path of one of them and the widths that exist (the photo script writes
 * `name-640.webp`, `name-960.webp`, `name-1280.webp`, `name-1920.webp`). Without widths the photo is one file. A path that does not end
 * in a width, or widths that do not include the path's own, are a mistake in the content and stop the build.
 */
export function photoSources(src: string, widths?: number[]): PhotoSources {
  if (!widths || widths.length === 0) return { src, small: src, full: src };
  const found = WIDTH_SUFFIX.exec(src);
  if (!found || !widths.includes(Number(found[1]))) {
    throw new Error(`The photo "${src}" must end in one of its widths (${widths.join(', ')}), like name-1280.webp.`);
  }
  const base = src.slice(0, found.index);
  const sorted = [...new Set(widths)].sort((a, b) => a - b);
  return {
    src,
    srcset: sorted.map((width) => `${base}-${width}.webp ${width}w`).join(', '),
    small: `${base}-${sorted[0]}.webp`,
    full: `${base}-${sorted[sorted.length - 1]}.webp`,
  };
}
