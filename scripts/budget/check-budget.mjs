// Fails when a built page is heavier than its budget (rule 3 of CLAUDE.md). Run after "npm run build"; inside verify.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PAGE_LIMITS } from './limits.mjs';
import { pageWeight } from './page-weight.mjs';

const ROOT = 'dist/client';

/** Every HTML file under a folder, with forward slashes. */
function pages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return path.endsWith('.html') ? [path.replace(/\\/g, '/')] : [];
  });
}

/** The size of a file, or null when there is none. */
function sizeOf(path) {
  return existsSync(path) && statSync(path).isFile() ? statSync(path).size : null;
}

if (!existsSync(ROOT)) {
  console.error(`No build found in ${ROOT}. Run "npm run build" first.`);
  process.exit(1);
}

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} KB`;
const problems = [];
console.log(
  `Page weight (limits: JS ${kb(PAGE_LIMITS.js)}, code ${kb(PAGE_LIMITS.code)}, total ${kb(PAGE_LIMITS.total)})`,
);
for (const page of pages(ROOT)) {
  const weight = pageWeight(readFileSync(page, 'utf8'), page, ROOT, sizeOf);
  const name = page.replace(`${ROOT}/`, '');
  console.log(
    `  ${name.padEnd(28)} JS ${kb(weight.js).padStart(8)}  code ${kb(weight.code).padStart(8)}  total ${kb(weight.total).padStart(9)}`,
  );
  for (const reference of weight.missing) problems.push(`${name}: names ${reference}, which is not in the build`);
  for (const [key, limit] of Object.entries(PAGE_LIMITS)) {
    if (weight[key] > limit) problems.push(`${name}: ${key} is ${kb(weight[key])}, over the ${kb(limit)} budget`);
  }
}

if (problems.length > 0) {
  console.error(`Performance budget failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('Performance budget passed.');
