import { describe, expect, it } from 'vitest';
import {
  COUNTED_KINDS,
  HIGHLIGHT_KINDS,
  hasWifi,
  missingEvidence,
  type Highlight,
  type HighlightKind,
} from '@domain/apartments/highlights';
import { listFiles, projectPath, readText } from './helpers/source-files';

/** The `highlights` block of a cabin's front matter: each kind and its optional count. */
function highlightsOf(text: string): Highlight[] {
  const block = /^highlights:\r?\n((?:[ ]{2,}.*\r?\n)+)/m.exec(text)?.[1] ?? '';
  return [...block.matchAll(/- kind: (\S+)(?:\r?\n\s+count: (\d+))?/g)].map(([, kind, count]) => ({
    kind: kind as HighlightKind,
    ...(count ? { count: Number(count) } : {}),
  }));
}

/** The features of one language: the lines after `- he:` or after `en:` inside the `features` block. */
function featuresOf(text: string, language: 'he' | 'en'): string[] {
  const block = /^features:\r?\n([\s\S]*?)^photos:/m.exec(text)?.[1] ?? '';
  const pattern = language === 'he' ? /^ {2}- he: (.*)$/gm : /^ {4}en: (.*)$/gm;
  return [...block.matchAll(pattern)].map(([, line]) => line.trim());
}

/**
 * Every apartment's badges are facts the owner's text names (H1), and every apartment lists Wi-Fi (the owner's standing
 * rule). The same check runs in the build (`content.config.ts`); this one runs in the fast test loop and names the file.
 */
describe('the badges of every apartment', () => {
  const cabins = listFiles('src/content/cabins', ['.md']);

  it('finds the apartments', () => {
    expect(cabins.length).toBeGreaterThan(0);
  });

  it.each(cabins.map((path) => [projectPath(path), path]))(
    '%s: Wi-Fi, known kinds, and a line in the text for each',
    (_name, path) => {
      const text = readText(path);
      const highlights = highlightsOf(text);
      expect(highlights.length).toBeGreaterThan(0);
      expect(hasWifi(highlights)).toBe(true);
      expect(highlights.every((item) => HIGHLIGHT_KINDS.includes(item.kind))).toBe(true);
      expect(new Set(highlights.map((item) => item.kind)).size).toBe(highlights.length);
      for (const item of highlights) if (item.count) expect(COUNTED_KINDS).toContain(item.kind);
      for (const language of ['he', 'en'] as const) {
        const features = featuresOf(text, language);
        expect(features.length).toBeGreaterThan(0);
        expect(missingEvidence(highlights, features, language)).toEqual([]);
      }
    },
  );

  it.each(cabins.map((path) => [projectPath(path), path]))(
    '%s: the Shabbos kitchen is listed (every apartment has one)',
    (_name, path) => {
      expect(highlightsOf(readText(path)).some((item) => item.kind === 'shabbos-kitchen')).toBe(true);
    },
  );
});
