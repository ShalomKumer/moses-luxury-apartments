// Checks the built site in dist/ (S4, S10, S13, L7): no source maps, no calendar secret, nothing the CSP
// would block (inline scripts, inline styles) and nothing loaded from another host.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Lists every file under a folder. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Each check: what it forbids, in which files, and the pattern that finds it. */
const CHECKS = [
  { what: 'a source map', files: /\.map$/, test: () => true },
  {
    what: 'a secret calendar address',
    files: /\.(m?js|html|json|css)$/,
    test: (text) => /calendar\.google\.com\/calendar\/ical/i.test(text),
  },
  {
    what: 'an inline script (blocked by the CSP)',
    files: /\.html$/,
    test: (text) => /<script\b(?![^>]*\bsrc=)[^>]*>/i.test(text),
  },
  {
    what: 'an inline style (blocked by the CSP)',
    files: /\.html$/,
    test: (text) => /<style\b|\sstyle\s*=/i.test(text),
  },
  {
    what: 'a script or stylesheet from another host',
    files: /\.html$/,
    test: (text) => /<(?:script|link)\b[^>]*(?:src|href)\s*=\s*["']?(?:https?:)?\/\//i.test(text),
  },
];

const problems = [];
for (const file of walk('dist')) {
  const text = /\.(m?js|html|json|css)$/.test(file) ? readFileSync(file, 'utf8') : '';
  for (const check of CHECKS) {
    if (check.files.test(file) && check.test(text)) problems.push(`${file}: ${check.what}`);
  }
}

/**
 * Languages (A3, A6): every page declares its language and direction, links its other-language twin, and an English page
 * holds no Hebrew letters except in the language switch. Every Hebrew page has an English one (404 is one shared file).
 */
const pages = walk('dist/client')
  .filter((file) => file.endsWith('.html'))
  .map((file) => ({ file, rel: file.replace(/\\/g, '/').replace('dist/client/', '') }));
const isEnglish = (page) => page.rel.startsWith('en/');
for (const page of pages) {
  const html = readFileSync(page.file, 'utf8');
  const expected = isEnglish(page) ? '<html lang="en" dir="ltr"' : '<html lang="he" dir="rtl"';
  if (!html.includes(expected)) problems.push(`${page.file}: expected ${expected}`);
  if (page.rel !== '404.html') {
    for (const hreflang of ['he', 'en', 'x-default']) {
      if (!html.includes(`hreflang="${hreflang}"`)) problems.push(`${page.file}: no hreflang="${hreflang}" link`);
    }
  }
  if (isEnglish(page)) {
    const withoutSwitch = html.replace(/<a\b[^>]*data-lang-switch[^>]*>[\s\S]*?<\/a>/g, '');
    if (/[֐-׿]/.test(withoutSwitch)) problems.push(`${page.file}: Hebrew letters on an English page`);
  }
}
const hebrewPages = pages.filter((page) => !isEnglish(page) && page.rel !== '404.html').length;
const englishPages = pages.filter(isEnglish).length;
if (hebrewPages !== englishPages) problems.push(`${hebrewPages} Hebrew pages but ${englishPages} English pages`);

if (problems.length > 0) {
  console.error(`Build output check failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('Build output check passed.');
