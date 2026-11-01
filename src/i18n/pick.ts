import type { Locale } from './locales';

/** Picks the text of a language out of a value that holds one per language. */
export function pick<T>(value: Record<Locale, T>, locale: Locale): T {
  return value[locale];
}
