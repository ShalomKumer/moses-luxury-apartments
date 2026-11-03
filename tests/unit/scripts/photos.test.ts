import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { encodePhoto } from '../../../scripts/photos/encode.mjs';
import { MAX_BYTES, VIEWER_WIDTH, WIDTHS } from '../../../scripts/photos/limits.mjs';
import { outputPath } from '../../../scripts/photos/output-path.mjs';
import { photoProblems } from '../../../scripts/photos/photo-rules.mjs';
import { planWidths } from '../../../scripts/photos/plan-variants.mjs';
import { webpChunks } from '../../../scripts/photos/webp-chunks.mjs';

const GPS = { IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '32/1 5/1 0/1' } };

/** A phone-like JPEG: stored sideways (orientation 6) with a copyright note and a GPS position in its EXIF. */
const phonePhoto = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: { r: 200, g: 120, b: 60 } } })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .withExif({ IFD0: { Copyright: 'someone' }, ...GPS })
    .toBuffer();

/** Repeatable noise that does not compress well, so a size ceiling can be set just under its size. */
const noise = (width: number, height: number) => {
  let seed = 12345;
  const bytes = Buffer.alloc(width * height * 3);
  for (let i = 0; i < bytes.length; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    bytes[i] = seed >> 16;
  }
  return sharp(bytes, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 100 })
    .toBuffer();
};

describe('planWidths', () => {
  it('makes every standard width a large source can fill', () => {
    expect(planWidths(4000)).toEqual(WIDTHS);
  });

  it('never enlarges: a source on a boundary gets that width, and no wider one', () => {
    expect(planWidths(1280)).toEqual([640, 1280]);
    expect(planWidths(1279)).toEqual([640]);
  });

  it('keeps a source narrower than the smallest width at its own width', () => {
    expect(planWidths(500)).toEqual([500]);
    expect(planWidths(1)).toEqual([1]);
  });

  it('refuses a width that is not a positive whole number', () => {
    for (const bad of [0, -3, 1.5, Number.NaN, undefined]) {
      expect(() => planWidths(bad as number)).toThrow(/usable width/);
    }
  });
});

describe('outputPath', () => {
  it('builds the path inside public/photos', () => {
    expect(outputPath('gefen', 'living-room', 1280)).toBe('public/photos/gefen/living-room-1280.webp');
  });

  it.each([
    ['../x', 'a'],
    ['gefen', '../a'],
    ['Gefen', 'a'],
    ['gefen', 'a b'],
    ['gefen', ''],
    ['gefen/sub', 'a'],
    ['gefen', 'a.webp'],
    ['-gefen', 'a'],
  ])('refuses %s / %s', (apartment, name) => {
    expect(() => outputPath(apartment, name, 640)).toThrow(/lower-case English words/);
  });

  it('refuses a missing name', () => {
    expect(() => outputPath('gefen', undefined as unknown as string, 640)).toThrow();
  });
});

describe('webpChunks', () => {
  /** A hand-made RIFF/WEBP file from (name, size) chunks; sizes are real so padding is exercised. */
  function riff(chunks: [string, number][]): Uint8Array {
    const parts = chunks.flatMap(([name, size]) => {
      const header = Buffer.alloc(8);
      header.write(name, 0, 'latin1');
      header.writeUInt32LE(size, 4);
      return [header, Buffer.alloc(size + (size % 2))];
    });
    const body = Buffer.concat([Buffer.from('WEBP'), ...parts]);
    const head = Buffer.alloc(8);
    head.write('RIFF', 0, 'latin1');
    head.writeUInt32LE(body.length, 4);
    return Buffer.concat([head, body]);
  }

  it('lists the chunks in order, with odd sizes padded', () => {
    expect(
      webpChunks(
        riff([
          ['VP8X', 10],
          ['VP8 ', 5],
          ['EXIF', 3],
        ]),
      ),
    ).toEqual(['VP8X', 'VP8 ', 'EXIF']);
  });

  it('returns null for something that is not a WebP, too short, or cut off', () => {
    expect(webpChunks(Buffer.from('not an image at all'))).toBeNull();
    expect(webpChunks(new Uint8Array(0))).toBeNull();
    expect(webpChunks(riff([['VP8 ', 100]]).subarray(0, 40))).toBeNull();
  });
});

describe('encodePhoto', () => {
  it('turns a sideways phone photo upright, in every width it can fill, with no metadata', async () => {
    const source = await phonePhoto(2000, 1000); // stored 2000x1000, shown 1000x2000
    const variants = await encodePhoto(source);
    expect(variants.map((variant) => variant.width)).toEqual([640]);
    for (const variant of variants) {
      const info = await sharp(variant.data).metadata();
      expect(info.format).toBe('webp');
      expect(info.width).toBe(640);
      expect(info.height).toBe(1280); // turned upright
      expect(info.exif).toBeUndefined();
      expect(info.xmp).toBeUndefined();
      expect(webpChunks(variant.data)).not.toContain('EXIF');
      expect(variant.data.length).toBeLessThanOrEqual(MAX_BYTES);
    }
  });

  it('makes all three widths from a wide upright photo', async () => {
    const source = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#888' } })
      .jpeg()
      .toBuffer();
    const variants = await encodePhoto(source);
    expect(variants.map((variant) => variant.width)).toEqual(WIDTHS);
  });

  it('lowers the quality until the file fits under the ceiling, or says it cannot', async () => {
    const source = await noise(700, 500);
    const [best] = await encodePhoto(source, Number.MAX_SAFE_INTEGER);
    const [fitted] = await encodePhoto(source, best.data.length - 1);
    expect(fitted.quality).toBeLessThan(best.quality);
    expect(fitted.data.length).toBeLessThan(best.data.length);
    await expect(encodePhoto(source, 100)).rejects.toThrow(/stays over 100 bytes/);
  });

  it('holds the files a page loads to a lower ceiling, and leaves the viewer file at the standard one', async () => {
    const source = await sharp(await noise(240, 120))
      .resize(2400, 1200)
      .jpeg()
      .toBuffer(); // smooth, so 1920 fits
    const standard = await encodePhoto(source);
    const pageCeiling = Math.floor(standard[1].data.length * 0.8); // below the 1280 file, above the 640 one
    const variants = await encodePhoto(source, MAX_BYTES, pageCeiling);
    for (const variant of variants.filter((item) => item.width < VIEWER_WIDTH)) {
      expect(variant.data.length).toBeLessThanOrEqual(pageCeiling);
    }
    const viewer = variants.find((item) => item.width === VIEWER_WIDTH);
    expect(viewer?.quality).toBe(standard.find((item) => item.width === VIEWER_WIDTH)?.quality);
  });

  it('never lets the page ceiling raise the standard one', async () => {
    const source = await noise(700, 500);
    const [best] = await encodePhoto(source, Number.MAX_SAFE_INTEGER);
    const [fitted] = await encodePhoto(source, best.data.length - 1, Number.MAX_SAFE_INTEGER);
    expect(fitted.data.length).toBeLessThan(best.data.length);
  });

  it('refuses a file that is not a picture', async () => {
    await expect(encodePhoto(Buffer.from('hello'))).rejects.toThrow();
  });
});

describe('photoProblems', () => {
  const bytesOf = (data: Uint8Array) => () => data;
  const never = () => {
    throw new Error('should not be read');
  };

  it('accepts a clean WebP and does not read other files', async () => {
    const clean = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#444' } })
      .webp()
      .toBuffer();
    expect(photoProblems('public/photos/gefen/a-640.webp', bytesOf(clean))).toEqual([]);
    expect(photoProblems('public/photos/gefen/1-outside.svg', never)).toEqual([]);
    expect(photoProblems('src/styles/global.css', never)).toEqual([]);
  });

  it('rejects a raster picture that skipped the script, but not the logo', () => {
    for (const path of ['public/photos/a.jpg', 'public/x.JPEG', 'src/assets/b.png', 'public/c.heic', 'public/d.avif']) {
      expect(photoProblems(path, never)).toHaveLength(1);
    }
    expect(photoProblems('public/brand/logo-full.jpg', never)).toEqual([]);
  });

  it('rejects a WebP that carries EXIF (and so maybe a GPS position)', async () => {
    const leaky = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#444' } })
      .webp()
      .withExif({ IFD0: { Copyright: 'someone' }, ...GPS })
      .toBuffer();
    expect(webpChunks(leaky)).toContain('EXIF');
    expect(photoProblems('public/photos/gefen/a-640.webp', bytesOf(leaky))).toEqual([
      expect.stringMatching(/camera metadata/),
    ]);
  });

  it('rejects a WebP over the ceiling, and a file that only has the name of one', () => {
    const big = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(MAX_BYTES)]);
    big.writeUInt32LE(big.length - 8, 4);
    expect(photoProblems('public/photos/a.webp', bytesOf(big))).toEqual([expect.stringMatching(/ceiling/)]);
    expect(photoProblems('public/photos/a.webp', bytesOf(Buffer.from('nope')))).toEqual([
      expect.stringMatching(/not a valid WebP/),
    ]);
  });
});

describe('the photo scripts, run in a throw-away folder', () => {
  const addPhoto = resolve('scripts/photos/add-photo.mjs');
  const checkPhotos = resolve('scripts/photos/check-photos.mjs');
  const folders: string[] = [];
  afterEach(() => folders.splice(0).forEach((folder) => rmSync(folder, { recursive: true, force: true })));

  const newFolder = () => {
    const folder = mkdtempSync(join(tmpdir(), 'photos-'));
    folders.push(folder);
    return folder;
  };
  const run = (cwd: string, script: string, ...args: string[]) =>
    spawnSync('node', [script, ...args], { cwd, encoding: 'utf8' });

  it('adds a photo as WebP files with the metadata gone, and refuses to overwrite', async () => {
    const folder = newFolder();
    writeFileSync(join(folder, 'IMG_1.jpg'), await phonePhoto(2400, 1600));
    const added = run(folder, addPhoto, 'IMG_1.jpg', 'gefen', 'living-room');
    expect(added.status).toBe(0);
    const written = readdirSync(join(folder, 'public/photos/gefen')).sort();
    expect(written).toEqual(['living-room-1280.webp', 'living-room-640.webp']);
    for (const file of written) {
      const bytes = readFileSync(join(folder, 'public/photos/gefen', file));
      expect(webpChunks(bytes)).not.toContain('EXIF');
    }
    const again = run(folder, addPhoto, 'IMG_1.jpg', 'gefen', 'living-room');
    expect(again.status).toBe(1);
    expect(again.stderr).toContain('Already exists');
  }, 60_000);

  it('stops with a plain message on a missing argument, a missing file, a bad name or a non-photo', () => {
    const folder = newFolder();
    expect(run(folder, addPhoto).stderr).toContain('Usage');
    expect(run(folder, addPhoto, 'nope.jpg', 'gefen', 'a').stderr).toContain('not found');
    writeFileSync(join(folder, 'text.jpg'), 'not a picture');
    expect(run(folder, addPhoto, 'text.jpg', 'gefen', 'a').stderr).toContain('could not be processed');
    expect(existsSync(join(folder, 'public'))).toBe(false);
  });

  it('writes nothing when the name is not allowed', async () => {
    const folder = newFolder();
    writeFileSync(join(folder, 'a.jpg'), await phonePhoto(800, 600));
    const result = run(folder, addPhoto, 'a.jpg', '../escape', 'x');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('lower-case English words');
    expect(result.stderr).not.toContain('at file:'); // a plain message, not a stack trace
    expect(existsSync(join(folder, 'public'))).toBe(false);
  }, 60_000);

  it('check-photos passes on a clean folder and fails on a raw JPEG', async () => {
    const folder = newFolder();
    mkdirSync(join(folder, 'public/photos/gefen'), { recursive: true });
    expect(run(folder, checkPhotos).status).toBe(0);
    writeFileSync(join(folder, 'public/photos/gefen/raw.jpg'), await phonePhoto(300, 200));
    const result = run(folder, checkPhotos);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('public/photos/gefen/raw.jpg');
  });
});
