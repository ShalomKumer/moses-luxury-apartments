// The legal pages and the 404 page (docs/design/legal.md), in a real browser: the page head, the table of contents (beside
// the text on a desktop, folded on a phone, a link moving focus to its section), the draft notice, the parts still to
// fill, the accessibility coordinator's card, the cancellation table, the current policy in the footer, and the 404's
// two ways on. The tests read the sample (draft) texts; when the lawyer's texts replace them, update what they expect.
import { expect, test } from '@playwright/test';
import { obscuredFocus } from './helpers/focus-obscured';
import { axeViolations } from './helpers/run-axe';

const PAGES = [
  { base: '', label: 'Hebrew', draft: 'טיוטה.', toFill: 'למילוי:', home: 'חזרה לדף הבית' },
  { base: '/en', label: 'English', draft: 'Draft.', toFill: 'To fill:', home: 'Back to the home page' },
];

for (const { base, label, draft, toFill, home } of PAGES) {
  test.describe(`legal pages, ${label}`, () => {
    test('the head shows the title, the summary and the date, with one h1', async ({ page }) => {
      await page.goto(`${base}/privacy/`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('.legal-head time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
      await expect(page.locator('.legal-head__summary')).not.toBeEmpty();
    });

    test('the draft notice starts with the word "Draft." and is a note', async ({ page }) => {
      await page.goto(`${base}/terms/`);
      const notice = page.locator('.draft-notice');
      await expect(notice).toHaveAttribute('role', 'note');
      await expect(notice).toContainText(draft);
    });

    test('a part still to fill starts with the word "To fill:"', async ({ page }) => {
      await page.goto(`${base}/terms/`);
      const boxes = page.locator('.to-fill');
      expect(await boxes.count()).toBeGreaterThan(0);
      for (const text of await boxes.allTextContents()) expect(text.trim().startsWith(toFill)).toBe(true);
    });

    test('the table of contents lists the sections, and a link moves focus to its heading', async ({
      page,
      viewport,
    }) => {
      await page.goto(`${base}/terms/`);
      const wide = (viewport?.width ?? 0) >= 992;
      const fold = page.locator('.toc__fold');
      if (wide) {
        await expect(fold).toBeHidden();
      } else {
        await expect(fold).toBeVisible();
        await fold.locator('summary').click();
      }
      const links = page.locator(wide ? '.toc__side a' : '.toc__fold a');
      expect(await links.count()).toBeGreaterThanOrEqual(3);
      const target = (await links.nth(2).getAttribute('href')) ?? '';
      await links.nth(2).click();
      const heading = page.locator(target);
      await expect(heading).toBeFocused();
      await expect(heading).toBeInViewport();
    });

    test('the folded table of contents opens by keyboard on a phone', async ({ page, viewport }) => {
      test.skip((viewport?.width ?? 0) >= 992, 'a wide screen shows the list beside the text');
      await page.goto(`${base}/terms/`);
      const summary = page.locator('.toc__fold summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.toc__fold')).toHaveAttribute('open', '');
      await expect(page.locator('.toc__fold a').first()).toBeVisible();
    });

    test('the table of contents sits beside the text and stays in view on a wide screen', async ({
      page,
      viewport,
    }) => {
      test.skip((viewport?.width ?? 0) < 992, 'a phone has one column');
      await page.setViewportSize({ width: viewport?.width ?? 1280, height: 900 });
      await page.goto(`${base}/terms/`);
      await page.locator('.legal__text').evaluate((node) => {
        const filler = document.createElement('div');
        filler.style.height = '2400px';
        node.append(filler);
      });
      const toc = page.locator('.toc');
      const text = page.locator('.legal__text');
      const [tocBox, textBox] = await Promise.all([toc.boundingBox(), text.boundingBox()]);
      expect(Math.abs((tocBox?.y ?? 0) - (textBox?.y ?? 0))).toBeLessThan(40);
      await page.evaluate(() => window.scrollTo(0, 900));
      expect((await toc.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
      await expect(toc).toBeInViewport();
    });

    test('the accessibility statement ends with the coordinator card, whose missing details show as parts to fill', async ({
      page,
    }) => {
      await page.goto(`${base}/accessibility/`);
      const card = page.locator('.coordinator');
      await expect(card).toBeVisible();
      await expect(card.locator('dt')).toHaveCount(4);
      await expect(card.locator('.to-fill').first()).toContainText(toFill);
    });

    test('only the accessibility statement has the coordinator card', async ({ page }) => {
      await page.goto(`${base}/privacy/`);
      await expect(page.locator('.coordinator')).toHaveCount(0);
    });

    test('the cancellation table is a named region a keyboard reaches, and the page does not scroll sideways', async ({
      page,
    }) => {
      await page.goto(`${base}/cancellation/`);
      const region = page.locator('.table-scroll');
      await expect(region).toHaveAttribute('role', 'region');
      await expect(region).toHaveAttribute('tabindex', '0');
      await expect(region.locator('caption')).not.toBeEmpty();
      expect(await region.locator('th').count()).toBe(3);
      await region.focus();
      await expect(region).toBeFocused();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('the footer marks the current policy and only that one', async ({ page }) => {
      await page.goto(`${base}/cancellation/`);
      const current = page.locator('.site-footer a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute('href', new RegExp(`${base}/cancellation/?$`));
    });

    test('a very long title wraps and the page never scrolls sideways', async ({ page }) => {
      await page.goto(`${base}/privacy/`);
      await page.locator('h1').evaluate((node) => {
        node.textContent = `${'Privacy '.repeat(30)}${'x'.repeat(60)}`;
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('a page without the draft notice has none (what a final page looks like)', async ({ page }) => {
      await page.goto(`${base}/privacy/`);
      await page.locator('.draft-notice').evaluate((node) => node.remove());
      await expect(page.locator('.draft-notice')).toHaveCount(0);
      expect(await axeViolations(page)).toEqual([]);
    });

    test('no focused element is hidden behind a stuck bar', async ({ page }) => {
      await page.goto(`${base}/accessibility/`);
      expect(await obscuredFocus(page)).toEqual([]);
    });

    test('the 404 page has two ways on in this language', async ({ page }) => {
      await page.goto('/404.html');
      const block = page.locator(`section[lang="${base ? 'en' : 'he'}"]`);
      await expect(block.locator('h1')).toHaveCount(1);
      await expect(block.locator('.not-found__number')).toHaveAttribute('aria-hidden', 'true');
      await expect(block.getByRole('link', { name: home })).toBeVisible();
      await expect(block.locator('.not-found__ways a')).toHaveCount(2);
    });
  });
}
