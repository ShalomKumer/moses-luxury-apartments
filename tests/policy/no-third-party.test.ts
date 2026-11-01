import { describe, expect, it } from 'vitest';
import { lineOf, listFiles, projectPath, readText } from './helpers/source-files';

/**
 * Anything that makes the visitor's browser load from another host: scripts, stylesheets, frames, images,
 * CSS url() and @import. Plain navigation links (<a href>) are allowed (L7).
 */
const FOREIGN_LOADS = [
  /<script\b[^>]*\bsrc\s*=\s*["']?(?:https?:)?\/\//gi,
  /<link\b[^>]*\bhref\s*=\s*["']?(?:https?:)?\/\//gi,
  /<iframe\b/gi,
  /<(?:img|source|video|audio|image)\b[^>]*\b(?:src|srcset|href)\s*=\s*["']?(?:https?:)?\/\//gi,
  /url\(\s*["']?(?:https?:)?\/\//gi,
  /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//gi,
];

/** Lists every foreign load in the files of a folder. */
function foreignLoads(folder: string, extensions: string[]): string[] {
  return listFiles(folder, extensions).flatMap((file) => {
    const text = readText(file);
    return FOREIGN_LOADS.flatMap((pattern) =>
      [...text.matchAll(pattern)].map((match) => `${projectPath(file)}:${lineOf(text, match.index)}`),
    );
  });
}

describe('no third-party loads (L6, L7)', () => {
  it('the source loads nothing from another host', () => {
    expect(foreignLoads('src', ['.astro', '.css', '.ts', '.md'])).toEqual([]);
  });

  it('the public files load nothing from another host', () => {
    expect(foreignLoads('public', ['.html', '.svg', '.css'])).toEqual([]);
  });

  it('no analytics, pixel or tracking code exists', () => {
    const tracking = /\b(gtag|googletagmanager|google-analytics|fbq|hotjar|clarity\.ms|plausible|cloudflareinsights)\b/gi;
    const found = listFiles('src', ['.astro', '.ts']).filter((file) => tracking.test(readText(file)));
    expect(found.map(projectPath)).toEqual([]);
  });
});

describe('no raw HTML from strings (S1)', () => {
  it('nothing writes HTML from a string or evaluates code', () => {
    const risky = /\b(innerHTML|outerHTML|insertAdjacentHTML|document\.write|set:html|eval\s*\(|new Function\s*\()/g;
    const found = listFiles('src', ['.astro', '.ts']).flatMap((file) => {
      const text = readText(file);
      return [...text.matchAll(risky)].map((match) => `${projectPath(file)}:${lineOf(text, match.index)}`);
    });
    expect(found).toEqual([]);
  });
});
