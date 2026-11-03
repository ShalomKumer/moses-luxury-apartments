import { describe, expect, it } from 'vitest';
import { pickCandidate } from '../../../scripts/budget/pick-candidate.mjs';
import { pageWeight } from '../../../scripts/budget/page-weight.mjs';

const SRCSET = '/p/a-640.webp 640w, /p/a-1280.webp 1280w, /p/a-1920.webp 1920w';

describe('pickCandidate', () => {
  it('takes the smallest file that is at least as wide as a phone needs (750 px)', () => {
    expect(pickCandidate(SRCSET)).toBe('/p/a-1280.webp');
    expect(pickCandidate(SRCSET, 600)).toBe('/p/a-640.webp');
    expect(pickCandidate(SRCSET, 1280)).toBe('/p/a-1280.webp');
  });

  it('takes the largest file when none is wide enough', () => {
    expect(pickCandidate('/p/a-640.webp 640w', 750)).toBe('/p/a-640.webp');
  });

  it('does not depend on the order of the candidates', () => {
    expect(pickCandidate('/p/a-1920.webp 1920w, /p/a-640.webp 640w')).toBe('/p/a-1920.webp');
  });

  it('ignores entries without a width and returns null when none is left', () => {
    expect(pickCandidate('/p/a.webp, /p/b.webp 2x')).toBeNull();
    expect(pickCandidate('')).toBeNull();
    expect(pickCandidate('/p/a.webp, /p/b-640.webp 640w')).toBe('/p/b-640.webp');
  });
});

describe('pageWeight with a srcset', () => {
  const sizes: Record<string, number> = {
    'dist/client/p/a-640.webp': 40_000,
    'dist/client/p/a-1280.webp': 110_000,
    'dist/client/p/a-1920.webp': 200_000,
    'dist/client/p/plain.webp': 5000,
  };
  const sizeOf = (path: string) => sizes[path] ?? null;

  it('counts the file a phone loads, not the largest and not the src', () => {
    const html = `<img src="/p/a-1280.webp" srcset="${SRCSET}" sizes="100vw" alt="">`;
    expect(pageWeight(html, 'dist/client/index.html', 'dist/client', sizeOf).images).toBe(110_000);
  });

  it('counts a photo used twice once, and a plain src as before', () => {
    const html = [
      `<img src="/p/a-1280.webp" srcset="${SRCSET}" alt="">`,
      `<img src="/p/a-1280.webp" alt="">`,
      '<img src="/p/plain.webp" alt="">',
    ].join('');
    expect(pageWeight(html, 'dist/client/index.html', 'dist/client', sizeOf).images).toBe(115_000);
  });

  it('reports a candidate that is not in the build', () => {
    const html = '<img src="/p/x-1280.webp" srcset="/p/x-640.webp 640w, /p/x-1280.webp 1280w" alt="">';
    expect(pageWeight(html, 'dist/client/index.html', 'dist/client', sizeOf).missing).toEqual(['/p/x-1280.webp']);
  });
});
