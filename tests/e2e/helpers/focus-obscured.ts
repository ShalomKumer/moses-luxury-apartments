import type { Page } from '@playwright/test';

/** What the page reports about the element that has focus. */
interface FocusReport {
  /** True once focus has left the page's elements (it reached the end of the tab order). */
  done: boolean;
  /** A short description of the element, for the failure message. */
  label: string;
  /** True when the middle of none of the element's lines is reached by it: covered by another element or off-window. */
  covered: boolean;
}

/**
 * Presses Tab through the whole page and returns the focusable elements whose middle is hidden behind something else
 * (WCAG 2.2, success criterion 2.4.11, focus not obscured). A sticky header or a cookie bar that covers the focused
 * link fails here. The browser scrolls a focused element into view, so a covered one is covered by the page's own
 * content, not by the scroll position.
 */
export async function obscuredFocus(page: Page): Promise<string[]> {
  const limit = (await page.locator('a[href], button, input, select, textarea, summary, [tabindex]').count()) + 2;
  const found: string[] = [];
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (let step = 0; step < limit; step += 1) {
    await page.keyboard.press('Tab');
    const report = await page.evaluate((): FocusReport => {
      const element = document.activeElement;
      if (!element || element === document.body || element === document.documentElement) {
        return { done: true, label: '', covered: false };
      }
      // A link that wraps onto two lines has one rectangle per line; its bounding box can be mostly empty space, so
      // each line's own middle is tried, and the link counts as visible when any one of them is reached.
      const reached = [...element.getClientRects()].some((box) => {
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        if (
          box.width === 0 ||
          box.height === 0 ||
          x < 0 ||
          y < 0 ||
          x >= window.innerWidth ||
          y >= window.innerHeight
        ) {
          return false;
        }
        const top = document.elementFromPoint(x, y);
        return top !== null && (element === top || element.contains(top));
      });
      const label = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''} "${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 40)}"`;
      return { done: false, label, covered: !reached };
    });
    if (report.done) break;
    if (report.covered) found.push(report.label);
  }
  return [...new Set(found)];
}
