// Licence allow-list over every installed package (C4). Fails on anything not allowed, unknown included.
// A new licence kind, or an exception, is a person's decision: add it here with the reason, and in docs/compliance.md.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Permissive licences: they do not oblige us to publish our own source. */
const ALLOWED = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'CC-BY-4.0',
  'Unlicense',
  'Python-2.0',
  'Zlib',
]);

/**
 * Build-time tools under a licence outside the allow-list. None of their code reaches what we ship
 * (the pages and the server bundle); each is listed with the reason it is accepted.
 */
const BUILD_ONLY_EXCEPTIONS = {
  // Approved by the user, 2026-11-01 (docs/compliance.md, C4).
  '@img/sharp-win32-x64':
    "LGPL-3.0 libvips binary; used by the photo script (scripts/photos) on the owner's machine; never shipped",
  lightningcss: "MPL-2.0 (file-level copyleft); Vite's CSS tool at build time; its code is not in our output",
  'lightningcss-win32-x64-msvc': 'MPL-2.0; the native binary of lightningcss above',
  // Approved by the user, 2026-11-01 (the plan of chore/browser-tests; docs/compliance.md, C4).
  'axe-core':
    'MPL-2.0 (file-level copyleft); the accessibility checker of the browser tests; injected into test pages only',
  '@axe-core/playwright': 'MPL-2.0; connects axe-core above to Playwright; used by tests/e2e only, never shipped',
};

/** Reads a package's licence as one SPDX expression, or null if it has none. */
function licenceOf(pkg) {
  if (typeof pkg.license === 'string') return pkg.license;
  if (pkg.license?.type) return pkg.license.type;
  if (Array.isArray(pkg.licenses)) return pkg.licenses.map((entry) => entry.type ?? entry).join(' OR ');
  return null;
}

/** Tells whether an SPDX expression is allowed: OR needs one allowed side, AND needs all. */
function isAllowed(expression) {
  const clean = expression.replace(/[()]/g, ' ').trim();
  return clean.split(/\s+OR\s+/i).some((option) => option.split(/\s+AND\s+/i).every((id) => ALLOWED.has(id.trim())));
}

/** Finds every package.json of installed packages, nested ones included. */
function installedPackages(nodeModules) {
  const found = [];
  if (!existsSync(nodeModules)) return found;
  for (const name of readdirSync(nodeModules)) {
    if (name.startsWith('.')) continue;
    const dirs = name.startsWith('@')
      ? readdirSync(join(nodeModules, name)).map((sub) => join(nodeModules, name, sub))
      : [join(nodeModules, name)];
    for (const dir of dirs) {
      const manifest = join(dir, 'package.json');
      if (existsSync(manifest)) found.push(manifest);
      found.push(...installedPackages(join(dir, 'node_modules')));
    }
  }
  return found;
}

const problems = [];
const seen = new Set();
for (const manifest of installedPackages('node_modules')) {
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  if (!pkg.name || seen.has(`${pkg.name}@${pkg.version}`)) continue;
  seen.add(`${pkg.name}@${pkg.version}`);
  const licence = licenceOf(pkg);
  if (licence && isAllowed(licence)) continue;
  if (BUILD_ONLY_EXCEPTIONS[pkg.name]) continue;
  problems.push(`${pkg.name}@${pkg.version}: ${licence ?? 'no licence field'}`);
}

if (problems.length > 0) {
  console.error(`Licence check failed for ${problems.length} package(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Licence check passed: ${seen.size} packages, all on the allow-list.`);
