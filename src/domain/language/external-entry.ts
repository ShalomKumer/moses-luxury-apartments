/** What the browser knows about how this page was reached. */
export interface EntryFacts {
  /** The type of the page's navigation entry ("navigate", "reload", "back_forward", "prerender"), or null when unknown. */
  navigationType: string | null;
  /** The address of the page the visitor came from; empty when there is none (a typed address, a messaging app). */
  referrer: string;
  /** The origin of this site ("https://example.com"). */
  ownOrigin: string;
}

/**
 * Tells whether the visitor arrived from outside the site: a new visit (not a reload, not a step back or forward) whose
 * previous page was not a page of this site. A move between the site's own pages, the click on the language switch
 * included, is never an entry, so the offer shows once and does not follow the visitor around. A referrer that cannot be
 * read is treated as an outside one; an unknown navigation type is not an entry. Pure: the page reads the browser.
 */
export function isExternalEntry({ navigationType, referrer, ownOrigin }: EntryFacts): boolean {
  if (navigationType !== 'navigate') return false;
  if (referrer === '') return true;
  try {
    return new URL(referrer).origin !== ownOrigin;
  } catch {
    return true;
  }
}
