// The "back to top" button (2026-11-10): hidden at the top of a page, shown after scrolling more than a screen and a half,
// takes the visitor to the top with focus there, sits at the end of the line, never covers the phone's request bar, and
// is a plain link to the top when JavaScript is off.
import { expect, test, type Page } from '@playwright/test';
import { axeViolations } from './helpers/run-axe';

const PAGES = [
  { label: 'a Hebrew apartment', path: '/cabins/nobility-1/', labelText: 'חזרה למעלה', endIsLeft: true },
  { label: 'an English apartment', path: '/en/cabins/nobility-1/', labelText: 'Back to top', endIsLeft: false },
  { label: 'the Hebrew home page', path: '/', labelText: 'חזרה למעלה', endIsLeft: true },
];

/** Scrolls two screens down and waits for the button to show. */
async function scrollFar(page: Page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await expect(page.locator('[data-back-to-top]')).toBeVisible();
}

for (const { label, path, labelText, endIsLeft } of PAGES) {
  test.describe(label, () => {
    test('is hidden at the top and shown after scrolling far', async ({ page }) => {
      await page.goto(path);
      const button = page.locator('[data-back-to-top]');
      await expect(button).toBeHidden();
      await page.evaluate(() => window.scrollTo(0, window.innerHeight));
      await expect(button).toBeHidden();
      await scrollFar(page);
      await expect(button).toHaveAccessibleName(labelText);
      await expect(button).toHaveAttribute('href', '#top');
    });

    test('takes the visitor to the top and leaves focus there, so the next Tab reaches the skip link', async ({
      page,
    }) => {
      await page.goto(path);
      await scrollFar(page);
      await page.locator('[data-back-to-top]').click();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      expect(await page.evaluate(() => document.activeElement?.id)).toBe('top');
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-link')).toBeFocused();
      await expect(page.locator('[data-back-to-top]')).toBeHidden();
    });

    test('is reached by the keyboard and works with Enter', async ({ page }) => {
      await page.goto(path);
      await scrollFar(page);
      await page.locator('[data-back-to-top]').focus();
      await expect(page.locator('[data-back-to-top]')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      expect(await page.evaluate(() => document.activeElement?.id)).toBe('top');
    });

    test('goes at once when the visitor asked for less motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await scrollFar(page);
      await page.locator('[data-back-to-top]').click();
      // no scrolling animation: the position is the top within a frame or two
      await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 1000 }).toBe(0);
    });

    test('sits at the end of the line, inside the window', async ({ page }) => {
      await page.goto(path);
      await scrollFar(page);
      const box = await page.locator('[data-back-to-top]').boundingBox();
      const view = page.viewportSize();
      if (!box || !view) throw new Error('no box');
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(view.width);
      expect(box.y + box.height).toBeLessThanOrEqual(view.height);
      if (endIsLeft) expect(box.x + box.width / 2).toBeLessThan(view.width / 2);
      else expect(box.x + box.width / 2).toBeGreaterThan(view.width / 2);
    });

    test('passes the accessibility check while shown', async ({ page }) => {
      await page.goto(path);
      await scrollFar(page);
      expect(await axeViolations(page)).toEqual([]);
    });
  });
}

test('on a phone, an apartment page lifts the button above the request bar and never overlaps it', async ({ page }) => {
  await page.goto('/cabins/nobility-1/');
  const view = page.viewportSize();
  if (!view || view.width >= 992) test.skip(true, 'the request bar is only on a phone');
  // the bar's height is published for the button to rise above it
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bottom-bar').trim()),
  ).toBe('5rem');
  // wherever the page is scrolled, the button and the bar (when shown) do not cover each other
  for (const screens of [1.6, 2.2, 3]) {
    await page.evaluate((factor) => window.scrollTo(0, window.innerHeight * factor), screens);
    await expect(page.locator('[data-back-to-top]')).toBeVisible();
    const [buttonBox, barBox] = await Promise.all([
      page.locator('[data-back-to-top]').boundingBox(),
      page.locator('.jump .button').boundingBox(),
    ]);
    if (!buttonBox || !barBox) throw new Error('no box');
    const apart =
      buttonBox.y + buttonBox.height <= barBox.y ||
      barBox.y + barBox.height <= buttonBox.y ||
      buttonBox.x + buttonBox.width <= barBox.x ||
      barBox.x + barBox.width <= buttonBox.x;
    expect(apart, `at ${screens} screens`).toBe(true);
  }
});

test('a page too short to scroll never shows it', async ({ page }) => {
  await page.goto('/404.html');
  await page.evaluate(() => window.scrollTo(0, 10000));
  await expect(page.locator('[data-back-to-top]')).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the button is a plain link to the top of the page and is always there', async ({ page }) => {
    await page.goto('/cabins/nobility-1/');
    const button = page.locator('[data-back-to-top]');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', '#top');
    await expect(page.locator('#top')).toHaveCount(1);
  });
});
