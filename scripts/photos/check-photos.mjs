// Fails when a picture entered the repo without the photo script (C3, L8). Inside "npm run verify".
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { photoProblems } from './photo-rules.mjs';

/** Every file under a folder, with forward slashes; a folder that does not exist has none. */
function walk(dir) {
  try {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path.replace(/\\/g, '/')];
    });
  } catch {
    return [];
  }
}

const problems = ['public', 'src']
  .flatMap(walk)
  .flatMap((path) => photoProblems(path, () => readFileSync(path)).map((problem) => `${path}: ${problem}`));

if (problems.length > 0) {
  console.error(
    `Photo check failed:\n  ${problems.join('\n  ')}\nAdd photos only with: npm run photos:add -- <file> <apartment> <name>`,
  );
  process.exit(1);
}
console.log('Photo check passed.');
