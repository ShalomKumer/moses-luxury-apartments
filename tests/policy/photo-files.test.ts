import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listFiles, projectPath, ROOT } from './helpers/source-files';

/** Every `src` and its `widths` line in a cabin's front matter. */
function photoEntries(text: string): { src: string; widths: number[] | null }[] {
  return [...text.matchAll(/- src: (\S+)\r?\n(?:\s+widths: \[([^\]]*)\])?/g)].map(([, src, widths]) => ({
    src,
    widths: widths ? widths.split(',').map((width) => Number(width.trim())) : null,
  }));
}

describe('the photos a cabin names', () => {
  const cabins = listFiles('src/content/cabins', ['.md']);

  it('finds the cabins', () => {
    expect(cabins.length).toBeGreaterThan(0);
  });

  it.each(cabins.map((path) => [projectPath(path), path]))(
    '%s: every file of every photo exists in public/',
    (_name, path) => {
      const missing: string[] = [];
      const entries = photoEntries(readFileSync(path, 'utf8'));
      expect(entries.length).toBeGreaterThan(0);
      for (const { src, widths } of entries) {
        const base = src.replace(/-\d+\.webp$/, '');
        const files = widths ? widths.map((width) => `${base}-${width}.webp`) : [src];
        for (const file of files) if (!existsSync(join(ROOT, 'public', file))) missing.push(file);
      }
      expect(missing).toEqual([]);
    },
  );
});
