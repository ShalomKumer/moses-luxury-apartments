import { describe, expect, it } from 'vitest';
import { photoSources } from '@domain/photos/photo-sources';

describe('photoSources', () => {
  it('lists every width, smallest first, and names the largest file for the viewer', () => {
    expect(photoSources('/photos/a/living-room-1280.webp', [1920, 640, 1280])).toEqual({
      src: '/photos/a/living-room-1280.webp',
      srcset:
        '/photos/a/living-room-640.webp 640w, /photos/a/living-room-1280.webp 1280w, /photos/a/living-room-1920.webp 1920w',
      small: '/photos/a/living-room-640.webp',
      full: '/photos/a/living-room-1920.webp',
    });
  });

  it('names the smallest file for a phone, whatever order the widths come in', () => {
    expect(photoSources('/photos/a/b-1280.webp', [1280, 960, 640]).small).toBe('/photos/a/b-640.webp');
    expect(photoSources('/photos/a/b-960.webp', [960]).small).toBe('/photos/a/b-960.webp');
  });

  it('works with a photo that has two widths only', () => {
    const sources = photoSources('/photos/a/terrace-1280.webp', [640, 1280]);
    expect(sources.full).toBe('/photos/a/terrace-1280.webp');
    expect(sources.srcset).toBe('/photos/a/terrace-640.webp 640w, /photos/a/terrace-1280.webp 1280w');
  });

  it('keeps a single-file photo as it is, with no srcset', () => {
    expect(photoSources('/photos/gefen/1-outside.svg')).toEqual({
      src: '/photos/gefen/1-outside.svg',
      small: '/photos/gefen/1-outside.svg',
      full: '/photos/gefen/1-outside.svg',
    });
    expect(photoSources('/photos/gefen/1-outside.svg', [])).toEqual({
      src: '/photos/gefen/1-outside.svg',
      small: '/photos/gefen/1-outside.svg',
      full: '/photos/gefen/1-outside.svg',
    });
  });

  it('counts a repeated width once', () => {
    expect(photoSources('/photos/a/b-640.webp', [640, 640]).srcset).toBe('/photos/a/b-640.webp 640w');
  });

  it('stops the build on a path that does not end in one of its widths', () => {
    expect(() => photoSources('/photos/a/b.webp', [640])).toThrow(/must end in one of its widths/);
    expect(() => photoSources('/photos/a/b-800.webp', [640, 1280])).toThrow(/must end in one of its widths/);
  });
});
