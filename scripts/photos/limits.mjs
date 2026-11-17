// The numbers of the photo pipeline (C3, L8), in one place: the script writes to them, the check reads the same ones.

/**
 * Widths a photo is made in, in pixels; a source narrower than a width is never enlarged to it. 960 is the file a phone
 * 375 px wide at twice the density loads (the smallest at least 750 wide), so a page weighs the 960 files, not the 1280 ones.
 */
export const WIDTHS = [640, 960, 1280, 1920];

/** The widest file: only the photo viewer loads it, so a page's weight does not include it. */
export const VIEWER_WIDTH = WIDTHS[WIDTHS.length - 1];

/** The widest file a phone loads: a page weighs the 960 files, so only the files up to this width count against its budget. */
export const PHONE_WIDTH = 960;

/** The most one photo file may weigh: the hero photo's ceiling is about 250 KB (CLAUDE.md, rule 2 for this project). */
export const MAX_BYTES = 250_000;

/** WebP quality tried from the best down, until the file fits under MAX_BYTES. */
export const QUALITIES = [82, 74, 66, 58, 50, 42];

/** Where the photos live, one folder per apartment. */
export const PHOTOS_DIR = 'public/photos';
