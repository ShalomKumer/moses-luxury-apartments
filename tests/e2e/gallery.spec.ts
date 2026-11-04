// The photo viewer by keyboard alone (row A3): it opens, keeps focus inside, follows the page's direction, closes with
// Escape and gives focus back to the photo that opened it.
import { expect, test } from '@playwright/test';
import { axeViolations } from './helpers/run-axe';

const PAGES = [
  { path: '/cabins/artist-estate/', label: 'Hebrew', forward: 'ArrowLeft', back: 'ArrowRight', first: /1 מתוך/ },
  { path: '/en/cabins/artist-estate/', label: 'English', forward: 'ArrowRight', back: 'ArrowLeft', first: /1 of/ },
];

for (const { path, label, forward, back, first } of PAGES) {
  test.describe(`photo viewer, ${label}`, () => {
    test('opens by keyboard, keeps focus inside, has no axe violations while open', async ({ page }) => {
      await page.goto(path);
      const photo = page.locator('[data-gallery-item="0"]');
      await photo.focus();
      await page.keyboard.press('Enter');

      const dialog = page.locator('[data-gallery-dialog]');
      await expect(dialog).toBeVisible();
      await expect(page.locator('[data-gallery-caption]')).toHaveText(first);

      // Tab round the viewer more times than it has controls. A modal dialog makes the page behind it inert, so focus is
      // either on a control inside the dialog or has left the page for the browser's own toolbar (body); it is never on
      // a link of the page behind.
      for (let press = 0; press < 8; press += 1) {
        await page.keyboard.press('Tab');
        const inside = await dialog.evaluate(
          (node) => node.contains(document.activeElement) || document.activeElement === document.body,
        );
        expect(inside).toBe(true);
      }
      expect(await axeViolations(page)).toEqual([]);
    });

    test('moves with the arrow keys that follow the page direction', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-item="0"]').focus();
      await page.keyboard.press('Enter');
      const caption = page.locator('[data-gallery-caption]');
      const start = await caption.textContent();

      await page.keyboard.press(forward);
      await expect(caption).not.toHaveText(start ?? '');
      await page.keyboard.press(back);
      await expect(caption).toHaveText(start ?? '');
    });

    test('closes with Escape and gives focus back to the photo that opened it', async ({ page }) => {
      await page.goto(path);
      // the first photo: a phone's grid shows no other (the viewer reaches them)
      const photo = page.locator('[data-gallery-item="0"]');
      await photo.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-gallery-dialog]')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.locator('[data-gallery-dialog]')).toBeHidden();
      await expect(photo).toBeFocused();
    });

    test('closes with its Close button by keyboard', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-item="0"]').focus();
      await page.keyboard.press('Enter');
      await page.locator('[data-gallery-close]').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-gallery-dialog]')).toBeHidden();
    });
  });
}
