// Checks the built site in dist/ (S4, S10, S13, L7): no source maps, no calendar secret, nothing the CSP
// would block (inline scripts, inline styles) and nothing loaded from another host.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
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
    // A canonical or alternate link is a pointer for a search engine, not a load: the one kind of link that may be absolute.
    what: 'a script or stylesheet from another host',
    files: /\.html$/,
    test: (text) =>
      (text.match(/<(?:script|link)\b[^>]*>/gi) ?? []).some(
        (tag) =>
          !/\brel\s*=\s*["']?(?:canonical|alternate)["'\s>]/i.test(tag) &&
          /\b(?:src|href)\s*=\s*["']?(?:https?:)?\/\//i.test(tag),
      ),
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
 * holds no Hebrew letters except in the language switch and the language offer. Every Hebrew page has an English one (404 is one shared file).
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
      if (!new RegExp(`<link rel="alternate" hreflang="${hreflang}" href="https?://`).test(html)) {
        problems.push(`${page.file}: no absolute hreflang="${hreflang}" link`);
      }
    }
  }
  if (isEnglish(page)) {
    const withoutSwitch = html
      .replace(/<a\b[^>]*data-lang-switch[^>]*>[\s\S]*?<\/a>/g, '')
      .replace(/<aside\b[^>]*data-language-offer[^>]*>[\s\S]*?<\/aside>/g, '');
    if (/[֐-׿]/.test(withoutSwitch)) problems.push(`${page.file}: Hebrew letters on an English page`);
  }
}
const hebrewPages = pages.filter((page) => !isEnglish(page) && page.rel !== '404.html').length;
const englishPages = pages.filter(isEnglish).length;
if (hebrewPages !== englishPages) problems.push(`${hebrewPages} Hebrew pages but ${englishPages} English pages`);

/**
 * Search and sharing (E2 to E4, E6): every page but 404 has one canonical link on the site's address, the Open Graph and
 * Twitter/X tags with an absolute preview image that is in the build, and an entry in the sitemap; the 404 page is `noindex`
 * and has no canonical link; `robots.txt` names the sitemap.
 */
const siteUrl = /SITE_URL = '([^']+)'/.exec(readFileSync('src/config/site-url.ts', 'utf8'))?.[1];
if (!siteUrl) problems.push('src/config/site-url.ts: no SITE_URL found');
const sitemap = existsSync('dist/client/sitemap.xml') ? readFileSync('dist/client/sitemap.xml', 'utf8') : '';
if (!sitemap) problems.push('dist/client/sitemap.xml: missing');
const robots = existsSync('dist/client/robots.txt') ? readFileSync('dist/client/robots.txt', 'utf8') : '';
if (!robots.split(/\r?\n/).includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  problems.push('dist/client/robots.txt: no "Sitemap:" line with the absolute address of sitemap.xml');
}
/** Reads the content of the meta tag with this property or name. */
const metaOf = (html, key) => new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`).exec(html)?.[1];
for (const page of pages) {
  const html = readFileSync(page.file, 'utf8');
  if (page.rel === '404.html') {
    if (!html.includes('<meta name="robots" content="noindex">')) problems.push(`${page.file}: not marked noindex`);
    if (html.includes('rel="canonical"')) problems.push(`${page.file}: a noindex page has a canonical link`);
    continue;
  }
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((match) => match[1]);
  if (canonicals.length !== 1) {
    problems.push(`${page.file}: ${canonicals.length} canonical links (expected 1)`);
    continue;
  }
  const [canonical] = canonicals;
  if (siteUrl && !canonical.startsWith(`${siteUrl}/`)) problems.push(`${page.file}: canonical is not on ${siteUrl}`);
  if (metaOf(html, 'og:url') !== canonical) problems.push(`${page.file}: og:url is not the canonical address`);
  for (const key of [
    'og:title',
    'og:description',
    'og:site_name',
    'og:locale',
    'twitter:title',
    'twitter:description',
  ]) {
    if (!metaOf(html, key)) problems.push(`${page.file}: no ${key}`);
  }
  if (metaOf(html, 'twitter:card') !== 'summary_large_image')
    problems.push(`${page.file}: no large-image twitter:card`);
  for (const key of ['og:image', 'twitter:image']) {
    const image = metaOf(html, key);
    if (!image || !/^https?:\/\//.test(image)) {
      problems.push(`${page.file}: ${key} is not an absolute address`);
    } else if (!existsSync(join('dist/client', image.replace(siteUrl ?? '', '')))) {
      problems.push(`${page.file}: ${key} points to a file that is not in the build`);
    }
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) problems.push(`${page.file}: not in sitemap.xml`);
}

if (problems.length > 0) {
  console.error(`Build output check failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('Build output check passed.');
