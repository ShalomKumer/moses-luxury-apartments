// Makes the preview image that a chat app or a social network shows when a page of the site is shared (E2, C3):  npm run brand:share
// public/brand/share.jpg  1200 x 630 pixels: the owner's whole logo lockup, centred on white (the logo file has a white
// ground of its own: on the cream of the site it would show as a box).
// It uses only the owner's logo (public/brand/logo-full.webp, made by `npm run brand:build`), never a photo of an apartment, so no
// photo whose rights are still to be confirmed is ever shown outside the site. The size is written in `src/config/site.ts`
// (tests/unit/config/share-image.test.ts fails when they differ). sharp writes no EXIF or other metadata.
import { existsSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

/** The logo file this is made from, and the file it makes. */
const SOURCE = 'public/brand/logo-full.webp';
const OUTPUT = 'public/brand/share.jpg';

/** The size every network accepts for a large card: 1.91 to 1 (1200 x 630). */
const WIDTH = 1200;
const HEIGHT = 630;

/** The ground of the card: the white of the logo file itself. */
const PAPER = '#ffffff';

/** Empty paper kept above and below the logo, in pixels (a network may crop the card's edges). */
const MARGIN = 40;

/** The JPEG quality: high, because the logo is thin lines and a low quality draws a haze around them. */
const QUALITY = 88;

if (!existsSync(SOURCE)) {
  console.error(`No such file: ${SOURCE}. Make the logo files first: npm run brand:build -- <logo-file>`);
  process.exit(1);
}

const logo = await sharp(SOURCE)
  .resize({ height: HEIGHT - 2 * MARGIN, fit: 'inside' })
  .toBuffer();

const bytes = await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: PAPER } })
  .composite([{ input: logo, gravity: 'centre' }])
  .jpeg({ quality: QUALITY, mozjpeg: true })
  .toBuffer();

writeFileSync(OUTPUT, bytes);
console.log(`${OUTPUT}  ${WIDTH} x ${HEIGHT}  ${Math.round(bytes.length / 1000)} KB`);
