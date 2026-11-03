import { describe, expect, it } from 'vitest';
import { splitFillMarkers } from '../../../src/domain/text/fill-markers';

describe('splitFillMarkers', () => {
  it('leaves a text with no marker as one plain piece', () => {
    expect(splitFillMarkers('plain words')).toEqual([{ kind: 'text', value: 'plain words' }]);
  });

  it('returns nothing for an empty text', () => {
    expect(splitFillMarkers('')).toEqual([]);
  });

  it('finds a Hebrew marker between words and labels it in Hebrew', () => {
    expect(splitFillMarkers('לפני [למילוי: הסכום] אחרי')).toEqual([
      { kind: 'text', value: 'לפני ' },
      { kind: 'fill', label: 'למילוי:', value: 'הסכום' },
      { kind: 'text', value: ' אחרי' },
    ]);
  });

  it('finds an English marker and labels it in English', () => {
    expect(splitFillMarkers('[TO FILL: the amount]')).toEqual([
      { kind: 'fill', label: 'To fill:', value: 'the amount' },
    ]);
  });

  it('finds several markers in one line, in order', () => {
    const segments = splitFillMarkers('[TO FILL: a], phone [TO FILL: b]');
    expect(segments.map((s) => s.kind)).toEqual(['fill', 'text', 'fill']);
  });

  it('keeps a bracket that is never closed as plain text', () => {
    expect(splitFillMarkers('[TO FILL: forgot to close')).toEqual([
      { kind: 'text', value: '[TO FILL: forgot to close' },
    ]);
  });

  it('keeps an empty marker as a box with no words', () => {
    expect(splitFillMarkers('[למילוי:]')).toEqual([{ kind: 'fill', label: 'למילוי:', value: '' }]);
  });

  it('does not treat other brackets as markers', () => {
    expect(splitFillMarkers('see [note] and [1]')).toEqual([{ kind: 'text', value: 'see [note] and [1]' }]);
  });
});
