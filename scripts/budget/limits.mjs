// The performance budget: a ceiling per page on a phone's first load, in bytes as served (before compression, which
// only makes real pages lighter). Changing a number is the user's decision, and it is written in docs/roadmap.md.
// Set 2026-11-01 from a measurement: every page was under 12 KB of HTML, 9 KB of CSS and 3 KB of JavaScript.

export const PAGE_LIMITS = {
  /** All JavaScript the page loads. The site needs almost none: a gallery dialog and a link builder. */
  js: 30_000,
  /** The page itself plus its stylesheets and scripts: what must arrive before anything can be drawn. */
  code: 100_000,
  /** Everything the page asks for on first load, pictures included (a picture below the fold counts too: on purpose). */
  total: 1_000_000,
};

/**
 * The code ceiling of an apartment page: it carries every other apartment's row folded under its button (their photos are
 * lazy and not counted, but their markup is), about 110 KB as served and about 12 KB compressed. The user's decision of
 * 2026-11-19; the JS and total ceilings are the same as for any page, and the other pages keep `PAGE_LIMITS.code`.
 */
export const APARTMENT_CODE_LIMIT = 125_000;

/** The ceilings of one built page, by its path under `dist/client` (an apartment page lives in `cabins/` or `en/cabins/`). */
export function limitsFor(pagePath) {
  return /(^|\/)cabins\//.test(pagePath) ? { ...PAGE_LIMITS, code: APARTMENT_CODE_LIMIT } : { ...PAGE_LIMITS };
}
