// The only way a photo enters the repo (C3, L8):  npm run photos:add -- <photo-file> <apartment> <photo-name> [--page-kb=<n>]
// --page-kb lowers the size ceiling of the files a page loads (640 and 1280 wide), for a photo shown in a row on other pages.
// Writes the WebP widths into public/photos/<apartment>/, with the camera's metadata (EXIF, GPS) removed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { encodePhoto } from './encode.mjs';
import { MAX_BYTES } from './limits.mjs';
import { outputPath } from './output-path.mjs';

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--'));
const [file, apartment, name] = positional;
const flags = args.filter((arg) => arg.startsWith('--'));
const pageKbFlag = flags.find((arg) => arg.startsWith('--page-kb='));

/** Prints why the run stopped, in plain words, and exits with an error. */
function stop(message) {
  console.error(message);
  process.exit(1);
}

if (!file || !apartment || !name || positional.length > 3 || flags.some((flag) => flag !== pageKbFlag)) {
  stop(
    'Usage: npm run photos:add -- <photo-file> <apartment> <photo-name> [--page-kb=<n>]\nExample: npm run photos:add -- C:\\photos\\IMG_1.jpg gefen living-room',
  );
}
if (!existsSync(file)) stop(`The file was not found: ${file}`);
const pageKb = pageKbFlag === undefined ? undefined : Number(pageKbFlag.slice('--page-kb='.length));
if (pageKb !== undefined && !(pageKb > 0 && pageKb * 1000 <= MAX_BYTES)) {
  stop(`--page-kb must be a number from 1 to ${MAX_BYTES / 1000}.`);
}
try {
  outputPath(apartment, name, 0); // only to check the names, before any work is done
} catch (error) {
  stop(error.message);
}

let variants;
try {
  variants = await encodePhoto(readFileSync(file), MAX_BYTES, pageKb === undefined ? MAX_BYTES : pageKb * 1000);
} catch (error) {
  stop(`The photo could not be processed (${error.message}). Send it as a JPEG and try again.`);
}

// Check every target before writing any, so a name that already exists leaves the folder untouched.
const targets = variants.map((variant) => ({ ...variant, path: outputPath(apartment, name, variant.width) }));
const taken = targets.filter((target) => existsSync(target.path));
if (taken.length > 0) stop(`Already exists, nothing written: ${taken.map((target) => target.path).join(', ')}`);

for (const target of targets) {
  mkdirSync(dirname(target.path), { recursive: true });
  writeFileSync(target.path, target.data);
  console.log(`${target.path}  ${Math.round(target.data.length / 1024)} KB  (quality ${target.quality})`);
}
console.log('Done. The camera data (EXIF, location) was removed.');
