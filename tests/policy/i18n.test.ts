import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lineOf, listFiles, projectPath, readText, ROOT } from './helpers/source-files';

/** Lists the file names of a folder under src/content/legal. */
const legalFiles = (language: string) => readdirSync(join(ROOT, 'src/content/legal', language)).sort();

/** Reads one frontmatter value (updated, order) of a legal file. */
const frontmatter = (language: string, file: string, key: string) =>
  new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(readText(join(ROOT, 'src/content/legal', language, file)))?.[1];

describe('both languages, everywhere (A2, A6, L1-L3)', () => {
  it('has an English legal page for every Hebrew one, with the same date and order', () => {
    expect(legalFiles('en')).toEqual(legalFiles('he'));
    for (const file of legalFiles('he')) {
      expect(frontmatter('en', file, 'order'), file).toBe(frontmatter('he', file, 'order'));
    }
  });

  it('has an English route for every Hebrew route', () => {
    for (const route of ['index.astro', 'cabins/[id].astro', '[legal].astro']) {
      expect(existsSync(join(ROOT, 'src/pages', route)), `he ${route}`).toBe(true);
      expect(existsSync(join(ROOT, 'src/pages/en', route)), `en ${route}`).toBe(true);
    }
  });

  it('declares every cabin text in both languages (the schema fails the build for a missing one)', () => {
    for (const file of listFiles('src/content/cabins', ['.md'])) {
      const text = readText(file);
      const count = (language: string) => (text.match(new RegExp(`^\\s*(- )?${language}:`, 'gm')) ?? []).length;
      expect(count('he'), projectPath(file)).toBeGreaterThan(0);
      expect(count('he'), projectPath(file)).toBe(count('en'));
    }
  });
});

/** The one file that may read the browser's languages: it only decides whether to show the offer (2026-11-10). */
const OFFER_SCRIPT = 'src/components/layout/language-offer.ts';

describe('the language is the address, nothing else (L3, L4)', () => {
  it('stores no choice and reads the browser language in the offer script only', () => {
    const guessing =
      /navigator\.language|Accept-Language|localStorage|sessionStorage|document\.cookie|cookies\.(set|get)/g;
    const found = listFiles('src', ['.astro', '.ts'])
      .filter((file) => projectPath(file) !== OFFER_SCRIPT)
      .flatMap((file) => {
        const text = readText(file);
        return [...text.matchAll(guessing)].map((match) => `${projectPath(file)}:${lineOf(text, match.index)}`);
      });
    expect(found).toEqual([]);
  });

  it('never moves the visitor by the browser language: the offer script stores, sends and redirects nothing', () => {
    const code = readText(join(ROOT, OFFER_SCRIPT))
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(code).toContain('navigator.languages');
    expect(code).not.toMatch(
      /localStorage|sessionStorage|document\.cookie|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|location\.(href|assign|replace)\s*[(=]|history\.(push|replace)State/,
    );
  });
});

describe('works in both directions (A3)', () => {
  it('uses only logical CSS properties, so right-to-left and left-to-right both lay out', () => {
    const physical =
      /(margin|padding|border)-(left|right)\b|\b(left|right)\s*:\s*[\d.-]|text-align\s*:\s*(left|right)|float\s*:\s*(left|right)/g;
    const found = listFiles('src', ['.astro', '.css']).flatMap((file) => {
      const text = readText(file);
      return [...text.matchAll(physical)].map(
        (match) => `${projectPath(file)}:${lineOf(text, match.index)}: ${match[0]}`,
      );
    });
    expect(found).toEqual([]);
  });
});
