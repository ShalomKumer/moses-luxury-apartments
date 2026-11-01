// The numbers of the photo pipeline (C3, L8), in one place: the script writes to them, the check reads the same ones.

/** Widths a photo is made in, in pixels; a source narrower than a width is never enlarged to it. */
export const WIDTHS = [640, 1280, 1920];

/** The most one photo file may weigh: the hero photo's ceiling is about 250 KB (CLAUDE.md, rule 2 for this project). */
export const MAX_BYTES = 250_000;

/** WebP quality tried from the best down, until the file fits under MAX_BYTES. */
export const QUALITIES = [82, 74, 66, 58, 50, 42];

/** Where the photos live, one folder per apartment. */
export const PHOTOS_DIR = 'public/photos';
