import { isExternalEntry } from '@domain/language/external-entry';
import { languageToOffer } from '@domain/language/suggest-language';

/** How the visitor reached this page, as the browser reports it ("navigate", "reload", "back_forward"), or null. */
function navigationType(): string | null {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  return entry?.type ?? null;
}

/**
 * Starts the language offer: a thin bar fixed to the bottom of the screen, shown only to a visitor who arrived from
 * outside the site and whose browser prefers the other language. It reads the browser's languages once and decides at
 * once; it stores nothing, sends nothing and never moves the visitor (the link is a plain link the visitor chooses to
 * follow, WCAG 3.2.2). While it is open it publishes its height as `--offer-bar`, so the "back to top" button rises above
 * it. Closing hides the bar and puts focus at the top of the page, so it is not lost; a move to another page of the site
 * shows no bar, so one closing is enough without remembering it. Without this script the bar stays hidden and the
 * language switch is still there.
 */
export function initLanguageOffer(offer: HTMLElement): void {
  const { pageLocale, offerLocale } = offer.dataset;
  if (!pageLocale || !offerLocale) return;
  const entry = { navigationType: navigationType(), referrer: document.referrer, ownOrigin: window.location.origin };
  if (!isExternalEntry(entry)) return;
  // an old browser has only the one language; a list that is missing says nothing, so nothing is offered
  const languages: readonly string[] = navigator.languages ?? [navigator.language];
  if (languageToOffer(pageLocale, languages) !== offerLocale) return;
  offer.hidden = false;

  const root = document.documentElement;
  const publishHeight = () => root.style.setProperty('--offer-bar', `${offer.offsetHeight}px`);
  const watcher = new ResizeObserver(publishHeight);
  watcher.observe(offer);
  publishHeight();

  offer.querySelector<HTMLButtonElement>('[data-language-offer-close]')?.addEventListener('click', () => {
    // focus first: the button is inside the bar that is about to hide
    document.getElementById('top')?.focus({ preventScroll: true });
    offer.hidden = true;
    watcher.disconnect();
    root.style.removeProperty('--offer-bar');
  });
}
