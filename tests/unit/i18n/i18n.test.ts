import { describe, expect, it } from 'vitest';
import { getMessages } from '@i18n/get-messages';
import { directionOf, isLocale, LOCALES, otherLocale } from '@i18n/locales';
import { en } from '@i18n/messages/en';
import { he } from '@i18n/messages/he';
import { alternatesOf, localizedPath } from '@i18n/paths';
import { pick } from '@i18n/pick';

/** Lists the dotted path of every text in a message tree. */
function keysOf(tree: unknown, prefix = ''): string[] {
  if (typeof tree === 'string') return [prefix];
  return Object.entries(tree as Record<string, unknown>).flatMap(([key, value]) => keysOf(value, prefix ? `${prefix}.${key}` : key));
}

/** Lists the {slot} names a text uses, sorted. */
const slotsOf = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

/** Reads a text out of a message tree by its dotted path. */
const textAt = (tree: unknown, path: string) =>
  path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], tree) as string;

describe('languages', () => {
  it('knows its two languages, their direction and the other one', () => {
    expect(LOCALES).toEqual(['he', 'en']);
    expect(directionOf('he')).toBe('rtl');
    expect(directionOf('en')).toBe('ltr');
    expect(otherLocale('he')).toBe('en');
    expect(otherLocale('en')).toBe('he');
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('picks the text of a language', () => {
    expect(pick({ he: 'שלום', en: 'Hello' }, 'en')).toBe('Hello');
    expect(getMessages('he')).toBe(he);
  });
});

describe('addresses', () => {
  it('keeps Hebrew at the root and puts English under /en/', () => {
    expect(localizedPath('/', 'he')).toBe('/');
    expect(localizedPath('/', 'en')).toBe('/en/');
    expect(localizedPath('/cabins/gefen', 'en')).toBe('/en/cabins/gefen');
    expect(localizedPath('privacy', 'en')).toBe('/en/privacy');
    expect(localizedPath('/privacy', 'he')).toBe('/privacy');
  });

  it('lists the same page in every language', () => {
    expect(alternatesOf('/terms')).toEqual([
      { locale: 'he', href: '/terms' },
      { locale: 'en', href: '/en/terms' },
    ]);
  });
});

describe('messages', () => {
  it('has the same keys in both languages and no empty text', () => {
    expect(keysOf(en)).toEqual(keysOf(he));
    for (const path of keysOf(he)) {
      expect(textAt(he, path).length, `he ${path}`).toBeGreaterThan(0);
      expect(textAt(en, path).length, `en ${path}`).toBeGreaterThan(0);
    }
  });

  it('uses the same {slots} in both languages, so a translation cannot drop a value', () => {
    for (const path of keysOf(he)) {
      expect(slotsOf(textAt(en, path)), path).toEqual(slotsOf(textAt(he, path)));
    }
  });

  it('writes English in Latin letters and Hebrew in Hebrew, apart from the brand and the placeholders', () => {
    const hebrew = /[֐-׿]/;
    for (const path of keysOf(en)) {
      expect(hebrew.test(textAt(en, path)), `en ${path} holds Hebrew letters`).toBe(false);
    }
    for (const path of keysOf(he).filter((p) => !p.startsWith('language.code'))) {
      const text = textAt(he, path);
      if (/^(brand\.logoAlt|common\.pageTitle|language\.)/.test(path)) continue;
      expect(/[A-Za-z]{4,}/.test(text.replace(/\{\w+\}/g, '')), `he ${path} holds English words`).toBe(false);
    }
  });
});
