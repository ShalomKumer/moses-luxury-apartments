/** The languages of the site. Hebrew is the default and has no prefix in its addresses; English lives under /en/. */
export const LOCALES = ['he', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'he';

/** The writing direction of a language, for the `dir` attribute. */
export type Direction = 'rtl' | 'ltr';

const DIRECTIONS: Record<Locale, Direction> = { he: 'rtl', en: 'ltr' };

/** Returns the writing direction of a language. */
export function directionOf(locale: Locale): Direction {
  return DIRECTIONS[locale];
}

/** Returns the other language: the one the language switch leads to. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'he' ? 'en' : 'he';
}

/** Tells whether a value is one of the site's languages. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
