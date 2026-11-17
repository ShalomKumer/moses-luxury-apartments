import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { SITE } from '@config/site';
import { ROOT } from '../../policy/helpers/source-files';

/** The sizes `src/config/site.ts` gives the two logo files are the sizes of the files: a page reserves the right room for them (no jump while they load). */
describe('the logo files', () => {
  it.each([
    ['full', SITE.logo.full],
    ['name', SITE.logo.name],
  ] as const)('the %s logo exists and has the size site.ts says', async (_part, logo) => {
    const path = join(ROOT, 'public', logo.src);
    expect(existsSync(path)).toBe(true);
    const meta = await sharp(path).metadata();
    expect(meta.format).toBe('webp');
    expect({ width: meta.width, height: meta.height }).toEqual({ width: logo.width, height: logo.height });
  });

  it('keeps each file light: a logo is on every page', async () => {
    const { statSync } = await import('node:fs');
    for (const logo of [SITE.logo.full, SITE.logo.name]) {
      expect(statSync(join(ROOT, 'public', logo.src)).size).toBeLessThan(80_000);
    }
  });
});
