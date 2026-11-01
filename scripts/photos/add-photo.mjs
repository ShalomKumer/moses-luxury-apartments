// The only way a photo enters the repo (C3, L8):  npm run photos:add -- <photo-file> <apartment> <photo-name>
// Writes the WebP widths into public/photos/<apartment>/, with the camera's metadata (EXIF, GPS) removed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { encodePhoto } from './encode.mjs';
import { outputPath } from './output-path.mjs';

const [file, apartment, name] = process.argv.slice(2);

/** Prints why the run stopped, in plain words, and exits with an error. */
function stop(message) {
  console.error(message);
  process.exit(1);
}

if (!file || !apartment || !name) {
  stop(
    'Usage: npm run photos:add -- <photo-file> <apartment> <photo-name>\nExample: npm run photos:add -- C:\\photos\\IMG_1.jpg gefen living-room',
  );
}
if (!existsSync(file)) stop(`The file was not found: ${file}`);
try {
  outputPath(apartment, name, 0); // only to check the names, before any work is done
} catch (error) {
  stop(error.message);
}

let variants;
try {
  variants = await encodePhoto(readFileSync(file));
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
