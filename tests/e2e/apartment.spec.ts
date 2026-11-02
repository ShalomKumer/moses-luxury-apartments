// The apartment page (docs/design/apartment.md), in a real browser: the request names the apartment, the gallery takes
// its shape from the photo count, "all photos" opens the viewer, the phone's jump button reaches the request, the card
// stays in view on a wide screen, and nothing sticky hides a focused element. The photo-count and guest-cap tests use
// the sample apartments (gefen: five photos and two guests, teena: three, zayit: one); when the owner's real content
// replaces them (stage 5), update those numbers with the content.
import { expect, test, type Page } from '@playwright/test';
import { obscuredFocus } from './helpers/focus-obscured';
import { axeViolations } from './helpers/run-axe';

const PAGES = [
  { base: '/cabins', label: 'Hebrew', position: /1 מתוך 5/ },
  { base: '/en/cabins', label: 'English', position: /1 of 5/ },
];

/** A day offset from today as "YYYY-MM-DD" (UTC; the offsets used are far enough from midnight not to matter). */
function dayFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

/** The message the WhatsApp link carries, decoded. */
async function whatsappText(page: Page): Promise<string> {
  const href = await page.locator('[data-request-bar] [data-booking-whatsapp]').getAttribute('href');
  return new URL(href ?? '').searchParams.get('text') ?? '';
}

/** How many of the gallery's photos the grid draws (not hidden). */
const shownPhotos = (page: Page) => page.locator('.gallery__item:visible').count();

for (const { base, label, position } of PAGES) {
  test.describe(`apartment page, ${label}`, () => {
    test('the request names the apartment, has no apartment choice and carries the same message in the preview', async ({
      page,
    }) => {
      await page.goto(`${base}/gefen/`);
      await expect(page.locator('[data-request-unit]')).toHaveCount(0);
      const name = (await page.locator('h1').textContent())?.trim() ?? '';
      const text = await whatsappText(page);
      expect(text).toContain(name);
      expect(await page.locator('[data-request-message]').textContent()).toBe(text);
    });

    test('offers no more guests than the apartment takes', async ({ page }) => {
      await page.goto(`${base}/gefen/`);
      const guests = page.locator('[data-request-guests]');
      await expect(guests.locator('option[value="2"]')).toBeEnabled();
      await expect(guests.locator('option[value="3"]')).toHaveCount(0);
      await guests.selectOption('2');
      expect(await whatsappText(page)).toContain('2');
    });

    test('two valid dates write the dates and the nights, with no note', async ({ page }) => {
      await page.goto(`${base}/gefen/`);
      await page.locator('[data-stay-in]').fill(dayFromNow(10));
      await page.locator('[data-stay-out]').fill(dayFromNow(13));
      expect(await whatsappText(page)).toMatch(/\d{2}\.\d{2}\.\d{4}.*\d{2}\.\d{2}\.\d{4}/);
      await expect(page.locator('[data-request-problem]')).toBeHidden();
    });

    test('a check-in in the past shows a note, stays out of the message, and the page has no axe violations', async ({
      page,
    }) => {
      await page.goto(`${base}/gefen/`);
      const before = await whatsappText(page);
      await page.locator('[data-stay-in]').fill('2020-01-01');
      await page.locator('[data-stay-out]').fill(dayFromNow(13));
      await expect(page.locator('[data-request-problem]')).toBeVisible();
      expect(await whatsappText(page)).toBe(before);
      expect(await axeViolations(page)).toEqual([]);
    });

    test('five photos: one large and four small on a wide screen, the first alone on a phone', async ({
      page,
      viewport,
    }) => {
      await page.goto(`${base}/gefen/`);
      const wide = (viewport?.width ?? 0) >= 768;
      expect(await shownPhotos(page)).toBe(wide ? 5 : 1);
      await expect(page.locator('[data-gallery-all]')).toContainText('5');
      if (wide) {
        const widths = await page
          .locator('.gallery__item:visible')
          .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
        expect(widths[0]).toBeGreaterThan(widths[1] * 1.5);
      }
    });

    test('three photos: one large and two', async ({ page, viewport }) => {
      test.skip((viewport?.width ?? 0) < 768, 'a phone shows the first photo only');
      await page.goto(`${base}/teena/`);
      expect(await shownPhotos(page)).toBe(3);
    });

    test('one photo: no "all photos" button and no arrows in the viewer', async ({ page }) => {
      await page.goto(`${base}/zayit/`);
      expect(await shownPhotos(page)).toBe(1);
      await expect(page.locator('[data-gallery-all]')).toHaveCount(0);
      await page.locator('[data-gallery-item="0"]').click();
      await expect(page.locator('[data-gallery-dialog]')).toBeVisible();
      await expect(page.locator('[data-gallery-prev], [data-gallery-next]')).toHaveCount(0);
    });

    test('"all photos" opens the viewer at the first photo and gives focus back to the button on Escape', async ({
      page,
    }) => {
      await page.goto(`${base}/gefen/`);
      const all = page.locator('[data-gallery-all]');
      await all.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-gallery-dialog]')).toBeVisible();
      await expect(page.locator('[data-gallery-caption]')).toHaveText(position);
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-gallery-dialog]')).toBeHidden();
      await expect(all).toBeFocused();
    });

    test('the jump button shows on a phone only, and leads to the request', async ({ page, viewport }) => {
      await page.goto(`${base}/gefen/`);
      const jump = page.locator('.jump a');
      if ((viewport?.width ?? 0) >= 992) {
        await expect(jump).toBeHidden();
        return;
      }
      await expect(jump).toBeVisible();
      await jump.click();
      await expect(page.locator('#request')).toBeInViewport();
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.getElementById('request')?.contains(document.activeElement))).toBe(
        true,
      );
    });

    test('the card stays in view while the details scroll, on a wide and tall screen', async ({ page, viewport }) => {
      test.skip((viewport?.width ?? 0) < 992, 'the card sits below the details on a phone');
      await page.setViewportSize({ width: viewport?.width ?? 1280, height: 900 });
      await page.goto(`${base}/gefen/`);
      // the sample text is short; give the details the length a real description will have, so the card has room to travel
      await page.locator('.cabin__details').evaluate((node) => {
        const filler = document.createElement('div');
        filler.style.height = '1600px';
        node.append(filler);
      });
      const columnsTop = await page
        .locator('.cabin__columns')
        .evaluate((node) => node.getBoundingClientRect().top + scrollY);
      await page.evaluate((y) => window.scrollTo(0, y + 500), columnsTop);
      const top = await page.locator('#request').evaluate((node) => node.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(80);
    });

    test('lists the other apartments and not this one', async ({ page }) => {
      await page.goto(`${base}/gefen/`);
      await expect(page.locator('.cabin__more .row')).toHaveCount(2);
      await expect(page.locator('.cabin__more a[href*="/cabins/gefen"]')).toHaveCount(0);
    });

    test('no focused element is hidden behind a stuck bar or card', async ({ page }) => {
      await page.goto(`${base}/gefen/`);
      expect(await obscuredFocus(page)).toEqual([]);
    });

    test('a very long name wraps and the page never scrolls sideways', async ({ page }) => {
      await page.goto(`${base}/gefen/`);
      await page.locator('h1').evaluate((node) => {
        node.textContent = `${'Moses '.repeat(40)}${'x'.repeat(60)}`;
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('has one h1 and no axe violations', async ({ page }) => {
      await page.goto(`${base}/gefen/`);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await axeViolations(page)).toEqual([]);
    });
  });
}
