import { describe, expect, it } from 'vitest';
import {
  COUNTED_KINDS,
  EVIDENCE,
  HIGHLIGHT_KINDS,
  hasWifi,
  highlightLabel,
  missingEvidence,
  orderHighlights,
  specialHighlights,
  type Highlight,
  type HighlightTexts,
} from '@domain/apartments/highlights';

const texts: HighlightTexts = {
  plain: Object.fromEntries(HIGHLIGHT_KINDS.map((kind) => [kind, `label ${kind}`])) as HighlightTexts['plain'],
  counted: { jacuzzi: '{count} jacuzzis', loft: '{count} lofts' },
};
const kinds = (list: Highlight[]) => list.map((item) => item.kind);

describe('orderHighlights', () => {
  it('puts the badges in the page order, whatever order the file lists them', () => {
    const list: Highlight[] = [{ kind: 'stone' }, { kind: 'jacuzzi' }, { kind: 'wifi' }, { kind: 'shabbos-kitchen' }];
    expect(kinds(orderHighlights(list))).toEqual(['wifi', 'shabbos-kitchen', 'jacuzzi', 'stone']);
  });

  it('drops a kind listed twice and keeps the first one, and never changes the input', () => {
    const list: Highlight[] = [{ kind: 'jacuzzi', count: 3 }, { kind: 'wifi' }, { kind: 'jacuzzi' }];
    expect(orderHighlights(list)).toEqual([{ kind: 'wifi' }, { kind: 'jacuzzi', count: 3 }]);
    expect(list).toHaveLength(3);
  });

  it('handles an empty list', () => {
    expect(orderHighlights([])).toEqual([]);
  });
});

describe('specialHighlights', () => {
  const list: Highlight[] = [
    { kind: 'murals' },
    { kind: 'wifi' },
    { kind: 'shabbos-kitchen' },
    { kind: 'sauna' },
    { kind: 'jacuzzi', count: 3 },
    { kind: 'view' },
  ];

  it('leaves out Wi-Fi and the Shabbos kitchen, which every apartment has', () => {
    expect(kinds(specialHighlights(list, 10))).toEqual(['jacuzzi', 'sauna', 'view', 'murals']);
  });

  it('keeps at most the number asked for, the first in page order', () => {
    expect(kinds(specialHighlights(list, 3))).toEqual(['jacuzzi', 'sauna', 'view']);
  });

  it('returns nothing for zero, a negative number or an apartment with nothing special', () => {
    expect(specialHighlights(list, 0)).toEqual([]);
    expect(specialHighlights(list, -2)).toEqual([]);
    expect(specialHighlights([{ kind: 'wifi' }, { kind: 'shabbos-kitchen' }], 3)).toEqual([]);
  });
});

describe('highlightLabel', () => {
  it('says the count for a countable kind above one', () => {
    expect(highlightLabel({ kind: 'jacuzzi', count: 3 }, texts)).toBe('3 jacuzzis');
    expect(highlightLabel({ kind: 'loft', count: 2 }, texts)).toBe('2 lofts');
  });

  it('says the plain label for one, for no count and for a kind that has no counted form', () => {
    expect(highlightLabel({ kind: 'jacuzzi', count: 1 }, texts)).toBe('label jacuzzi');
    expect(highlightLabel({ kind: 'jacuzzi' }, texts)).toBe('label jacuzzi');
    expect(highlightLabel({ kind: 'sauna', count: 4 }, texts)).toBe('label sauna');
  });

  it('only gives a count to the kinds that can be many', () => {
    expect([...COUNTED_KINDS].sort()).toEqual(Object.keys(texts.counted).sort());
  });
});

describe('missingEvidence', () => {
  const features = ['Wi-Fi', 'A large jacuzzi in the courtyard', 'A sleeping loft reached by wooden stairs'];

  it('is empty when every badge has its line in the text', () => {
    const list: Highlight[] = [{ kind: 'wifi' }, { kind: 'jacuzzi' }, { kind: 'courtyard' }, { kind: 'loft' }];
    expect(missingEvidence(list, features, 'en')).toEqual([]);
  });

  it('names the badges the text never mentions', () => {
    const list: Highlight[] = [{ kind: 'wifi' }, { kind: 'sauna' }, { kind: 'pool' }];
    expect(missingEvidence(list, features, 'en')).toEqual(['sauna', 'pool']);
  });

  it('checks the Hebrew text with the Hebrew words', () => {
    const he = ['אינטרנט אלחוטי (Wi-Fi)', 'ג׳קוזי גדול בחצר', 'מטבח מאובזר לשבת, לחופשה נוחה גם בשבתות'];
    const list: Highlight[] = [
      { kind: 'wifi' },
      { kind: 'jacuzzi' },
      { kind: 'courtyard' },
      { kind: 'shabbos-kitchen' },
    ];
    expect(missingEvidence(list, he, 'he')).toEqual([]);
    expect(missingEvidence([{ kind: 'sauna' }], he, 'he')).toEqual(['sauna']);
  });

  it('finds nothing when the feature list is empty', () => {
    expect(missingEvidence([{ kind: 'wifi' }], [], 'en')).toEqual(['wifi']);
    expect(missingEvidence([], [], 'he')).toEqual([]);
  });

  it('has a pattern for every kind in both languages', () => {
    for (const kind of HIGHLIGHT_KINDS) {
      expect(EVIDENCE[kind].he).toBeInstanceOf(RegExp);
      expect(EVIDENCE[kind].en).toBeInstanceOf(RegExp);
    }
  });
});

describe('hasWifi', () => {
  it('is true only when Wi-Fi is listed', () => {
    expect(hasWifi([{ kind: 'jacuzzi' }, { kind: 'wifi' }])).toBe(true);
    expect(hasWifi([{ kind: 'jacuzzi' }])).toBe(false);
    expect(hasWifi([])).toBe(false);
  });
});
