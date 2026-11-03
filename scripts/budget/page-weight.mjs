// Works out what one built page weighs on first load, from its HTML and the sizes of the files it names. Pure:
// the sizes come from an injected function, so no disk is touched here.
import { dirname, normalize } from 'node:path/posix';
import { pickCandidate } from './pick-candidate.mjs';

/** Every value of an attribute in the tags matching a pattern. */
function attributeValues(html, tagPattern, attribute) {
  const values = [];
  for (const [tag] of html.matchAll(tagPattern)) {
    const found = tag.match(new RegExp(`\\s${attribute}\\s*=\\s*["']([^"']+)["']`, 'i'));
    if (found) values.push({ tag, value: found[1] });
  }
  return values;
}

/** The file a phone loads for one <img>: the candidate of its `srcset` for a 375 px screen at twice the density, else its `src`. */
function imageFile(tag) {
  const srcset = tag.match(/\ssrcset\s*=\s*["']([^"']+)["']/i)?.[1];
  const candidate = srcset ? pickCandidate(srcset) : null;
  return candidate ?? tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? null;
}

/**
 * The files a page names, split into scripts, stylesheets and images. A picture with a `srcset` is counted at the file a
 * phone loads (`pickCandidate`); a `<picture>` with several `<source>` elements is not read, and the site uses none.
 */
function references(html) {
  const links = attributeValues(html, /<link\b[^>]*>/gi, 'href');
  const relOf = (tag) => (tag.match(/\srel\s*=\s*["']([^"']+)["']/i)?.[1] ?? '').toLowerCase();
  return {
    js: [
      ...attributeValues(html, /<script\b[^>]*>/gi, 'src').map((ref) => ref.value),
      ...links.filter(({ tag }) => relOf(tag).includes('modulepreload')).map((ref) => ref.value),
    ],
    css: links.filter(({ tag }) => relOf(tag).includes('stylesheet')).map((ref) => ref.value),
    images: [...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => imageFile(tag)).filter((file) => file !== null),
  };
}

/** The file in the build folder a page address points to, or null for an address that is not a local file. */
function localPath(reference, pagePath, root) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) return null;
  const encoded = reference.split(/[?#]/)[0];
  let clean = encoded;
  try {
    clean = decodeURIComponent(encoded); // a file name in Hebrew or with a space is written percent-encoded
  } catch {
    // a malformed escape: keep the text as written, the file will then be reported missing
  }
  return normalize(clean.startsWith('/') ? `${root}${clean}` : `${dirname(pagePath)}/${clean}`);
}

/**
 * The first-load weight of a page.
 * @param {string} html the page's HTML
 * @param {string} pagePath the page's path inside the build folder, with forward slashes
 * @param {string} root the build folder
 * @param {(path: string) => number | null} sizeOf the size of a file in bytes, or null if it does not exist
 * @returns {{ html: number, js: number, css: number, images: number, code: number, total: number, missing: string[] }}
 */
export function pageWeight(html, pagePath, root, sizeOf) {
  const refs = references(html);
  const missing = [];
  const sum = (list) =>
    [...new Set(list)].reduce((bytes, reference) => {
      const path = localPath(reference, pagePath, root);
      if (path === null) return bytes;
      const size = sizeOf(path);
      if (size === null) missing.push(reference);
      return bytes + (size ?? 0);
    }, 0);
  const own = Buffer.byteLength(html);
  const js = sum(refs.js);
  const css = sum(refs.css);
  const images = sum(refs.images);
  return { html: own, js, css, images, code: own + js + css, total: own + js + css + images, missing };
}
