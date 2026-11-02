import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isKept, RANGES, subsetText } from '../../../scripts/fonts/charset.mjs';
import { FONTS } from '../../../scripts/fonts/fonts.mjs';

describe('font character set', () => {
  it('keeps Hebrew letters, points, geresh and the shekel sign', () => {
    for (const char of ['א', 'ת', 'ֳ', '׳', '״', '₪']) expect(isKept(char)).toBe(true);
  });

  it('keeps basic Latin and the marks that steer mixed-direction text', () => {
    for (const char of ['A', 'z', '0', ' ', '‏', '‎']) expect(isKept(char)).toBe(true);
  });

  it('drops scripts the site does not use', () => {
    for (const char of ['ж', '漢', 'é', '😀']) expect(isKept(char)).toBe(false);
  });

  it('lists every character of every range exactly once', () => {
    const text = subsetText();
    const expected = RANGES.reduce((sum, [from, to]) => sum + (to - from + 1), 0);
    expect(Array.from(text)).toHaveLength(expected);
    expect(new Set(Array.from(text)).size).toBe(expected);
  });
});

describe('the font files in the repo (C1, L7)', () => {
  for (const font of FONTS) {
    const folder = join('public', 'fonts', font.folder);

    it(`${font.folder}: a WOFF2 file with the licence text beside it`, () => {
      const file = join(folder, `${font.folder}.woff2`);
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file).subarray(0, 4).toString('latin1')).toBe('wOF2');
      const licence = readFileSync(join(folder, 'OFL.txt'), 'utf8');
      expect(licence).toContain('SIL Open Font License');
    });

    it(`${font.folder}: small enough for a phone's first load`, () => {
      expect(statSync(join(folder, `${font.folder}.woff2`)).size).toBeLessThan(40_000);
    });
  }
});
