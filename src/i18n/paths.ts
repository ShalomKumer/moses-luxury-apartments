import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

/**
 * Returns the address of a page in a language. `path` is the page's own address without a language ("/", "/cabins/gefen",
 * "/privacy"); Hebrew keeps it as it is and English puts it under /en/. The address is the language choice: nothing is
 * stored and nobody is redirected by the browser's language.
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === '/' ? '/en/' : `/en${clean}`;
}

/** An address of the same page, with the language it is in. */
export interface Alternate {
  locale: Locale;
  href: string;
}

/** Lists the same page in every language, for the `hreflang` links and the language switch. */
export function alternatesOf(path: string): Alternate[] {
  return LOCALES.map((locale) => ({ locale, href: localizedPath(path, locale) }));
}
