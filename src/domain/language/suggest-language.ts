/** A language the site is written in: the only two it can offer. */
export type OfferedLanguage = 'he' | 'en';

/** Reads the main part of a browser language tag ("en-US" is "en", "he_IL" is "he"); "iw" is the old code of Hebrew. */
function mainLanguage(tag: unknown): OfferedLanguage | 'other' | null {
  if (typeof tag !== 'string') return null;
  const main = tag.trim().toLowerCase().split(/[-_]/)[0];
  if (main === '') return null;
  if (main === 'he' || main === 'iw') return 'he';
  if (main === 'en') return 'en';
  return 'other';
}

/**
 * Which language to offer a visitor on a page, or null for no offer. The browser's languages come in the order the visitor
 * prefers them: the first Hebrew or English one wins. A visitor whose list holds neither (a French browser) is offered
 * English on a Hebrew page and nothing on an English one; an empty list says nothing, so nothing is offered. Nothing is
 * offered when the page is already in the language the visitor prefers. Pure: the page reads the browser, this only decides.
 */
export function languageToOffer(pageLanguage: string, browserLanguages: readonly unknown[]): OfferedLanguage | null {
  const tags = browserLanguages.map(mainLanguage).filter((tag) => tag !== null);
  if (tags.length === 0) return null;
  const preferred = tags.find((tag): tag is OfferedLanguage => tag !== 'other') ?? 'en';
  return preferred === pageLanguage ? null : preferred;
}
