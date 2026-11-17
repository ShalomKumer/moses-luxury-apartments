import { showBackToTop } from '@domain/scroll/back-to-top';

/**
 * Starts the "back to top" button: shows it once the page is scrolled far enough, and on a click scrolls up (at once when
 * the visitor asked the system for less motion) and moves focus to the top of the page, so the next Tab reaches the first
 * link. Without this script the button is a plain link to the top that is always shown, so it still works.
 */
export function initBackToTop(link: HTMLAnchorElement): void {
  const top = document.getElementById(link.hash.slice(1));
  // the button is shown only once this script runs and the page has been scrolled: without it the link just stays
  link.dataset.enhanced = '';

  let queued = false;
  const update = () => {
    queued = false;
    link.toggleAttribute('data-visible', showBackToTop(window.scrollY, window.innerHeight));
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();

  link.addEventListener('click', (event) => {
    event.preventDefault();
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // focus first: the button hides itself as the page scrolls up, and focus must not be left on a hidden button
    top?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  });
}
