import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { PAGE_LIMITS } from '../../../scripts/budget/limits.mjs';
import { pageWeight } from '../../../scripts/budget/page-weight.mjs';

const ROOT = 'dist/client';
const sizes: Record<string, number> = {
  'dist/client/_astro/app.js': 3000,
  'dist/client/_astro/chunk.js': 1000,
  'dist/client/_astro/page.css': 9000,
  'dist/client/photos/hero-1920.webp': 200_000,
  'dist/client/cabins/gefen/local.webp': 50_000,
};
const sizeOf = (path: string) => sizes[path] ?? null;

describe('pageWeight', () => {
  it('adds up the page, its scripts, stylesheets and images', () => {
    const html = [
      '<link rel="stylesheet" href="/_astro/page.css">',
      '<script type="module" src="/_astro/app.js"></script>',
      '<img src="/photos/hero-1920.webp" alt="">',
    ].join('');
    const weight = pageWeight(html, 'dist/client/index.html', ROOT, sizeOf);
    expect(weight).toMatchObject({ js: 3000, css: 9000, images: 200_000, missing: [] });
    expect(weight.code).toBe(html.length + 12_000);
    expect(weight.total).toBe(html.length + 212_000);
  });

  it('counts a file named twice only once, and a module preload as JavaScript', () => {
    const html =
      '<link rel="modulepreload" href="/_astro/chunk.js"><script src="/_astro/chunk.js"></script><img src="/photos/hero-1920.webp"><img src="/photos/hero-1920.webp">';
    const weight = pageWeight(html, 'dist/client/index.html', ROOT, sizeOf);
    expect(weight.js).toBe(1000);
    expect(weight.images).toBe(200_000);
  });

  it('resolves a relative address against the page folder, and ignores queries and fragments', () => {
    const weight = pageWeight('<img src="local.webp?v=2#x">', 'dist/client/cabins/gefen/index.html', ROOT, sizeOf);
    expect(weight.images).toBe(50_000);
  });

  it('reads a percent-encoded file name as the file it names', () => {
    const weight = pageWeight(
      '<img src="/photos/%D7%9E%D7%98%D7%91%D7%97.webp"><img src="/photos/bad%E0%A4%A.webp">',
      'dist/client/index.html',
      ROOT,
      (path) => (path === 'dist/client/photos/מטבח.webp' ? 7000 : null),
    );
    expect(weight.images).toBe(7000);
    expect(weight.missing).toEqual(['/photos/bad%E0%A4%A.webp']);
  });

  it('ignores other hosts and data addresses (another check forbids them) and non-stylesheet links', () => {
    const html = [
      '<script src="https://cdn.example.com/x.js"></script>',
      '<script src="//cdn.example.com/y.js"></script>',
      '<img src="data:image/png;base64,AAAA">',
      '<link rel="icon" href="/favicon.svg">',
      '<link rel="alternate" hreflang="en" href="/en/">',
    ].join('');
    expect(pageWeight(html, 'dist/client/index.html', ROOT, sizeOf)).toMatchObject({
      js: 0,
      css: 0,
      images: 0,
      missing: [],
    });
  });

  it('reports a file the page names that is not in the build, and does not count it', () => {
    const weight = pageWeight('<img src="/photos/gone.webp">', 'dist/client/index.html', ROOT, sizeOf);
    expect(weight.missing).toEqual(['/photos/gone.webp']);
    expect(weight.images).toBe(0);
  });

  it('copes with an empty page and with attributes in any order and quote style', () => {
    expect(pageWeight('', 'dist/client/index.html', ROOT, sizeOf)).toMatchObject({ html: 0, total: 0 });
    const html = "<link href='/_astro/page.css' rel='stylesheet'><script defer src='/_astro/app.js'></script>";
    expect(pageWeight(html, 'dist/client/index.html', ROOT, sizeOf)).toMatchObject({ css: 9000, js: 3000 });
  });

  it('counts a <picture> at its narrow-screen source, once, and not also its <img>', () => {
    const html =
      '<picture><source media="(max-width: 47.99rem)" srcset="/photos/row-640.webp"><img src="/photos/row-1280.webp" srcset="/photos/row-640.webp 640w, /photos/row-1280.webp 1280w"></picture>';
    const weight = pageWeight(html, 'dist/client/index.html', ROOT, (path) =>
      path === 'dist/client/photos/row-640.webp'
        ? 30_000
        : path === 'dist/client/photos/row-1280.webp'
          ? 150_000
          : null,
    );
    expect(weight.images).toBe(30_000);
    expect(weight.missing).toEqual([]);
  });

  it('reads the srcset of a narrow-screen source, and falls back to the <img> without one', () => {
    const sizeOfRow = (path: string) =>
      ({ 'dist/client/photos/s-640.webp': 20_000, 'dist/client/photos/s-960.webp': 40_000 })[path] ?? null;
    const withSrcset =
      '<picture><source media="(max-width:48rem)" srcset="/photos/s-640.webp 640w, /photos/s-1280.webp 1280w"><img src="/photos/s-960.webp"></picture>';
    expect(pageWeight(withSrcset, 'dist/client/index.html', ROOT, sizeOfRow).missing).toEqual(['/photos/s-1280.webp']);
    const noPhoneSource =
      '<picture><source media="(min-width: 60rem)" srcset="/photos/big.webp"><img src="/photos/s-960.webp"></picture>';
    expect(pageWeight(noPhoneSource, 'dist/client/index.html', ROOT, sizeOfRow).images).toBe(40_000);
  });

  it('reads a descriptor-less narrow-screen srcset as its first file, without the comma', () => {
    const html =
      '<picture><source media="(max-width: 30rem)" srcset="/photos/hero-1920.webp, /photos/other.webp"><img src="/photos/x.webp"></picture>';
    expect(pageWeight(html, 'dist/client/index.html', ROOT, sizeOf)).toMatchObject({ images: 200_000, missing: [] });
  });

  it('still counts the <img> tags outside a <picture>', () => {
    const html =
      '<picture><source media="(max-width: 47.99rem)" srcset="/photos/hero-1920.webp"></picture><img src="local.webp">';
    expect(pageWeight(html, 'dist/client/cabins/gefen/index.html', ROOT, sizeOf).images).toBe(250_000);
  });

  it('does not count a lazy image folded inside a closed <details>, which the browser does not fetch', () => {
    const lazyRow =
      '<picture><source media="(max-width: 30rem)" srcset="/photos/hero-1920.webp"><img src="/photos/x.webp" loading="lazy"></picture>';
    const closed = `<details><summary>more</summary><ul><li>${lazyRow}</li><li><img src="local.webp" loading="lazy"></li></ul></details>`;
    expect(pageWeight(closed, 'dist/client/cabins/gefen/index.html', ROOT, sizeOf)).toMatchObject({
      images: 0,
      missing: [],
    });
  });

  it('counts the same images once the <details> is open, and any image the browser fetches at once', () => {
    const lazyRow =
      '<picture><source media="(max-width: 30rem)" srcset="/photos/hero-1920.webp"><img src="/photos/x.webp" loading="lazy"></picture>';
    const open = `<details open><summary>more</summary>${lazyRow}</details>`;
    expect(pageWeight(open, 'dist/client/index.html', ROOT, sizeOf).images).toBe(200_000);
    const eager = '<details><summary>more</summary><img src="local.webp"></details>';
    expect(pageWeight(eager, 'dist/client/cabins/gefen/index.html', ROOT, sizeOf).images).toBe(50_000);
    const notOpen = '<details data-open="1"><img src="local.webp" loading="lazy"></details>';
    expect(pageWeight(notOpen, 'dist/client/cabins/gefen/index.html', ROOT, sizeOf).images).toBe(0);
  });

  it('counts the bytes of Hebrew text, not its characters', () => {
    expect(pageWeight('שלום', 'dist/client/index.html', ROOT, sizeOf).html).toBe(8);
  });
});

describe('check-budget, run in a throw-away folder', () => {
  const entry = resolve('scripts/budget/check-budget.mjs');
  const folders: string[] = [];
  afterEach(() => folders.splice(0).forEach((folder) => rmSync(folder, { recursive: true, force: true })));

  /** A build folder holding one page, one script of the given size and one image of the given size. */
  function build(scriptBytes: number, imageBytes: number): string {
    const folder = mkdtempSync(join(tmpdir(), 'budget-'));
    folders.push(folder);
    mkdirSync(join(folder, 'dist/client/_astro'), { recursive: true });
    writeFileSync(
      join(folder, 'dist/client/index.html'),
      '<script type="module" src="/_astro/app.js"></script><img src="/hero.webp" alt="">',
    );
    writeFileSync(join(folder, 'dist/client/_astro/app.js'), Buffer.alloc(scriptBytes));
    writeFileSync(join(folder, 'dist/client/hero.webp'), Buffer.alloc(imageBytes));
    return folder;
  }
  const check = (folder: string) => spawnSync('node', [entry], { cwd: folder, encoding: 'utf8' });

  it('passes a light page and prints the weights', () => {
    const result = check(build(1000, 1000));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('index.html');
  });

  it('passes a page exactly on the ceiling and fails one byte over', () => {
    expect(check(build(PAGE_LIMITS.js, 1000)).status).toBe(0);
    const over = check(build(PAGE_LIMITS.js + 1, 1000));
    expect(over.status).toBe(1);
    expect(over.stderr).toContain('js is');
  });

  it('fails on a page whose pictures are too heavy', () => {
    const result = check(build(1000, PAGE_LIMITS.total));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('total is');
  });

  it('fails on a file the page names that is missing, and without any build', () => {
    const folder = build(1000, 1000);
    rmSync(join(folder, 'dist/client/hero.webp'));
    expect(check(folder).stderr).toContain('not in the build');
    rmSync(join(folder, 'dist'), { recursive: true });
    const result = check(folder);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('npm run build');
  });
});
