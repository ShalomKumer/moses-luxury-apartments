// Before launch: no placeholder, sample content, sample photo or sample contact detail is left (L11, C3, H1).
// It is expected to fail until the owner's details, photos and texts are in.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Lists every file under a folder. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** What may not be in the source at launch, and why. */
const FORBIDDEN = [
  { pattern: /\[למילוי/, why: 'a placeholder to fill' },
  { pattern: /\[TO FILL/, why: 'an English placeholder to fill' },
  { pattern: /\*\*DRAFT\.\*\*/, why: 'an English legal text still marked as a draft' },
  { pattern: /sample content|sample description|sample illustration/i, why: 'sample English text' },
  { pattern: /example\.com/, why: 'a sample email address' },
  { pattern: /050-000-0000/, why: 'a sample phone number' },
  { pattern: /תוכן לדוגמה|תיאור לדוגמה|איור לדוגמה/, why: 'sample cabin text' },
  { pattern: /\|\s*sample,/, why: 'a sample photo (src/content/photos.md)' },
  {
    pattern: /creator or photographer to be confirmed/,
    why: 'a photo whose creator or photographer is not yet confirmed (src/content/photos.md)',
  },
  { pattern: /\*\*טיוטה\.\*\*/, why: 'a legal text still marked as a draft' },
  { pattern: /^draft:/, why: 'a legal page still marked as a draft (the `draft` field of its front matter)' },
  {
    pattern: /(name|phone|email|lastCheck|checkInTime|checkOutTime): null as string \| null/,
    why: 'an accessibility coordinator detail, or the check-in or check-out time, still to fill',
  },
];

const problems = [];
for (const file of walk('src')) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const { pattern, why } of FORBIDDEN) {
      if (pattern.test(line)) problems.push(`${file}:${index + 1}: ${why}`);
    }
  });
}

if (problems.length > 0) {
  console.error(`Not ready to launch, ${problems.length} item(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('Launch check passed: no placeholder or sample content left.');
