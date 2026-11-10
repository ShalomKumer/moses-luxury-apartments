// Makes the two logo files of the site from the owner's logo page (C3):  npm run brand:build -- <logo-file>
// public/brand/logo-full.webp  the whole lockup (the contact area)
// public/brand/logo-name.webp  the roof and both names (the top of every page)
// The owner's file is a large white page with the lockup in the middle: each file is the lockup's own rectangle plus a thin margin,
// resized for a phone at three times the density. It prints the size of each file: the same numbers go in `src/config/site.ts`
// (tests/unit/config/logo-files.test.ts fails when they differ).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { inkBounds, padRect } from './ink-bounds.mjs';

/** Where the files go. */
const OUTPUT_DIR = 'public/brand';

/** A pixel darker than this is part of the drawing (the page is white; the gold lines are about 150). */
const INK_THRESHOLD = 215;

/** Empty paper kept around the drawing, in pixels of the owner's file. */
const MARGIN = 14;

/**
 * The roof and the two names end this fraction of the way down the lockup (the owner's file of 2026-11-08: they end at
 * 372 of 819 rows, then come the gold lines, the heart and the slogans). Measured, not found: the line below the names is
 * thin gold text that a threshold cannot tell from the names.
 */
const NAME_PART = 0.456;

/** The widths of the files, in pixels: a phone at three times the density shows the header logo about 130 px wide, the contact logo 224 px. */
const WIDTHS = { name: 520, full: 720 };

/**
 * The owner's page is not pure white: its paper is 250 to 254 in places (the file went through a JPEG once), which the
 * page would show as a faint box around the logo. Everything lighter than this becomes white.
 */
const WHITE_POINT = 244;

/** The WebP quality: high, because the logo is thin dark lines on white and a low quality draws a haze around them. */
const QUALITY = 92;

const [file] = process.argv.slice(2);
if (!file || process.argv.length > 3) {
  console.error(
    'Usage: npm run brand:build -- <logo-file>\nExample: npm run brand:build -- C:\\logo\\moses_combined_logo.png',
  );
  process.exit(1);
}
if (!existsSync(file)) {
  console.error(`No such file: ${file}`);
  process.exit(1);
}

const { data, info } = await sharp(file)
  .flatten({ background: '#ffffff' })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const lockup = inkBounds(data, info.width, info.height, { threshold: INK_THRESHOLD });
if (!lockup || lockup.width < 400 || lockup.height < 300) {
  console.error('The file is too small or has no drawing on it: a logo of at least 400 x 300 pixels is needed.');
  process.exit(1);
}

const nameRows = Math.round(lockup.height * NAME_PART);
const nameInk = inkBounds(data, info.width, info.height, {
  threshold: INK_THRESHOLD,
  region: { left: lockup.left, top: lockup.top, width: lockup.width, height: nameRows },
});
const crops = {
  full: padRect(lockup, MARGIN, info.width, info.height),
  name: padRect(nameInk ?? lockup, MARGIN, info.width, info.height),
};

mkdirSync(OUTPUT_DIR, { recursive: true });
for (const [part, rect] of Object.entries(crops)) {
  const { data: bytes, info: made } = await sharp(file)
    .flatten({ background: '#ffffff' })
    .extract(rect)
    .linear(255 / WHITE_POINT, 0)
    .resize({ width: WIDTHS[part], withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });
  const path = `${OUTPUT_DIR}/logo-${part}.webp`;
  writeFileSync(path, bytes);
  console.log(`${path}  ${made.width} x ${made.height}  ${Math.round(bytes.length / 1000)} KB`);
}
