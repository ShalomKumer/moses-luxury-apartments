import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { SITE } from '@config/site';
import { SITE_URL } from '@config/site-url';
import { ROOT } from '../../policy/helpers/source-files';

/** The sharing image is the file `site.ts` says, at the size the networks want, carrying no hidden data (E2, C3). */
describe('the sharing image', () => {
  const path = join(ROOT, 'public', SITE.shareImage.src);

  it('exists and has the size site.ts says', async () => {
    expect(existsSync(path)).toBe(true);
    const meta = await sharp(path).metadata();
    expect(meta.format).toBe('jpeg');
    expect({ width: meta.width, height: meta.height }).toEqual({
      width: SITE.shareImage.width,
      height: SITE.shareImage.height,
    });
  });

  it('is a large card of the usual 1.91 to 1 shape', () => {
    expect(SITE.shareImage.width / SITE.shareImage.height).toBeCloseTo(1.91, 1);
  });

  it('is light, because a chat app downloads it for every shared link', () => {
    expect(statSync(path).size).toBeLessThan(200_000);
  });

  it('carries no EXIF, GPS or other metadata', async () => {
    const meta = await sharp(path).metadata();
    expect(meta.exif).toBeUndefined();
    expect(meta.icc).toBeUndefined();
  });
});

describe('the site address', () => {
  it('is an https address of an origin only, with no trailing slash', () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });
});
