// The home page's booking-request bar and layout, in a real browser (docs/design/home.md): the message follows the
// choices, a bad date shows a note and stays out of the message, the guests follow the apartment, the fonts load
// from our own host, the rows alternate by the text direction, and the rows beyond the first five sit folded (once there are more than five).
import { expect, test, type Page } from '@playwright/test';
import { axeViolations } from './helpers/run-axe';

const PAGES = [
  { path: '/', label: 'Hebrew', rtl: true },
  { path: '/en/', label: 'English', rtl: false },
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

for (const { path, label, rtl } of PAGES) {
  test.describe(`home page bar, ${label}`, () => {
    test('the preview and both links carry the same message, with no dates and no apartment at first', async ({
      page,
    }) => {
      await page.goto(path);
      const preview = (await page.locator('[data-request-message]').textContent()) ?? '';
      expect(await whatsappText(page)).toBe(preview);
      const mail = await page.locator('[data-request-bar] [data-booking-email]').getAttribute('href');
      expect(decodeURIComponent(mail ?? '')).toContain(preview.split('\n')[0]);
      expect(preview.split('\n')).toHaveLength(2);
    });

    test('choosing an apartment and guests writes both into the message', async ({ page }) => {
      await page.goto(path);
      const unit = page.locator('[data-request-unit]');
      await unit.selectOption({ index: 1 });
      const name = (await unit.locator('option:checked').textContent())?.trim() ?? '';
      await page.locator('[data-request-guests]').selectOption('2');
      const text = await whatsappText(page);
      expect(text).toContain(name);
      expect(text).toContain('2');
      expect(await page.locator('[data-request-message]').textContent()).toBe(text);
    });

    test('offers no more guests than the chosen apartment takes, and resets a number that is too high', async ({
      page,
    }) => {
      await page.goto(path);
      const unit = page.locator('[data-request-unit]');
      const guests = page.locator('[data-request-guests]');
      await guests.selectOption('12');
      expect(await guests.inputValue()).toBe('12');
      // Tarpat 18 takes nine guests (the Artist's Estate, the first, takes fourteen)
      await unit.selectOption('tarpat-18');
      expect(await guests.inputValue()).toBe('');
      await expect(guests.locator('option[value="10"]')).toBeDisabled();
      await expect(guests.locator('option[value="9"]')).toBeEnabled();
    });

    test('two valid dates write the dates and the nights into the message', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-stay-in]').fill(dayFromNow(10));
      await page.locator('[data-stay-out]').fill(dayFromNow(13));
      const text = await whatsappText(page);
      expect(text).toMatch(/\d{2}\.\d{2}\.\d{4}.*\d{2}\.\d{2}\.\d{4}/);
      expect(text).toContain('3');
      await expect(page.locator('[data-request-problem]')).toBeHidden();
    });

    test('a check-in in the past shows a note, stays out of the message, and the page still has no axe violations', async ({
      page,
    }) => {
      await page.goto(path);
      const before = await whatsappText(page);
      await page.locator('[data-stay-in]').fill('2020-01-01');
      await page.locator('[data-stay-out]').fill(dayFromNow(13));
      const note = page.locator('[data-request-problem]');
      await expect(note).toBeVisible();
      await expect(note).not.toBeEmpty();
      expect(await whatsappText(page)).toBe(before);
      expect(await axeViolations(page)).toEqual([]);
    });

    test('a check-out that is not after the check-in shows a note and keeps only the check-in', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-stay-in]').fill(dayFromNow(10));
      await page.locator('[data-stay-out]').fill(dayFromNow(10));
      await expect(page.locator('[data-request-problem]')).toBeVisible();
      expect(await whatsappText(page)).toMatch(/\d{2}\.\d{2}\.\d{4}/);
      expect((await whatsappText(page)).match(/\d{2}\.\d{2}\.\d{4}/g)).toHaveLength(1);
      await page.locator('[data-stay-out]').fill(dayFromNow(12));
      await expect(page.locator('[data-request-problem]')).toBeHidden();
    });

    test('has one h1, and every control of the bar has a visible label', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      for (const control of await page.locator('[data-request-bar] select, [data-request-bar] input').all()) {
        const id = await control.getAttribute('id');
        await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      }
    });

    test('loads its three fonts from our own host', async ({ page }) => {
      await page.goto(path);
      const loaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts].filter((font) => font.status === 'loaded').map((font) => font.family);
      });
      expect(loaded.sort()).toEqual(['Frank Ruhl Libre', 'Gveret Levin', 'Heebo'].sort());
    });

    test('keeps the headline and the slogan to two lines on a phone, in both languages', async ({ page, viewport }) => {
      test.skip((viewport?.width ?? 0) >= 768, 'the lines are wide enough on a larger screen');
      await page.goto(path);
      for (const selector of ['.hero h1', '.hero__slogan']) {
        const lines = await page.locator(selector).evaluate((element) => {
          const style = getComputedStyle(element);
          return Math.round(element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight));
        });
        expect(lines, `${selector} wraps to ${lines} lines`).toBeLessThanOrEqual(2);
      }
    });

    test('alternates the apartment rows by the start and end of the line', async ({ page, viewport }) => {
      test.skip((viewport?.width ?? 0) < 768, 'the rows stack on a phone');
      await page.goto(path);
      if (await page.locator('.more').count()) await page.locator('.more__summary').click(); // rows beyond the fold
      const photos = await page
        .locator('.row__photo')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect().left + node.getBoundingClientRect().width / 2),
        );
      const mid = await page.evaluate(() => window.innerWidth / 2);
      const onStartSide = photos.map((x) => (rtl ? x > mid : x < mid));
      expect(onStartSide).toEqual(photos.map((_, index) => index % 2 === 0));
    });
  });
}

/** How many apartments the home page shows before the fold (the user's choice, 2026-11-08): pinned here on purpose, the same number as `ROWS_SHOWN` in `HomePage.astro`; changing one without the other fails the first test below. */
const ROWS_SHOWN = 5;
const FOLD = [
  {
    path: '/',
    label: 'Hebrew',
    show: (n: number) => (n === 1 ? 'הצגת דירה נוספת' : `הצגת עוד ${n} דירות`),
    hide: 'הסתרת הדירות הנוספות',
  },
  {
    path: '/en/',
    label: 'English',
    show: (n: number) => (n === 1 ? 'Show one more apartment' : `Show ${n} more apartments`),
    hide: 'Hide the other apartments',
  },
];

for (const { path, label, show, hide } of FOLD) {
  test.describe(`the fold of the home page, ${label}`, () => {
    test('folds nothing while the apartments are no more than the number shown, and the rest beyond it', async ({
      page,
    }) => {
      await page.goto(path);
      const total = await page.locator('#cabins .row').count();
      await expect(page.locator('.more')).toHaveCount(total > ROWS_SHOWN ? 1 : 0);
      await expect(page.locator('#cabins .row:visible')).toHaveCount(Math.min(total, ROWS_SHOWN));
    });

    // The cases below need a fold, which exists once the apartments outnumber ROWS_SHOWN; until then there is nothing to open.
    test('says how many apartments are folded', async ({ page }) => {
      await page.goto(path);
      test.skip((await page.locator('.more').count()) === 0, 'no fold until there are more apartments than are shown');
      const total = await page.locator('#cabins .row').count();
      await expect(page.locator('.more')).not.toHaveAttribute('open', '');
      await expect(page.locator('.more__show')).toHaveText(show(total - ROWS_SHOWN));
      await expect(page.locator('.more__show')).toBeVisible();
      await expect(page.locator('.more__hide')).toBeHidden();
    });

    test('loads no photo of a folded apartment until it is opened', async ({ page }) => {
      await page.goto(path);
      test.skip((await page.locator('.more').count()) === 0, 'no fold until there are more apartments than are shown');
      // the photo folders of the folded rows, read from their lazy images
      const folded = await page
        .locator('.more__rows img')
        .evaluateAll((images) => [
          ...new Set(
            images.map(
              (image) =>
                new URL(image.getAttribute('src') ?? '', location.href).pathname.split('/').slice(0, 3).join('/') + '/',
            ),
          ),
        ]);
      expect(folded.length).toBeGreaterThan(0);
      const requested: string[] = [];
      page.on('request', (request) => requested.push(new URL(request.url()).pathname));
      await page.reload();
      await page.locator('.more').scrollIntoViewIfNeeded();
      await page.waitForLoadState('networkidle');
      expect(requested.filter((url) => folded.some((prefix) => url.startsWith(prefix)))).toEqual([]);
      await page.locator('.more__summary').click();
      await page.locator('.more__rows').scrollIntoViewIfNeeded();
      await expect.poll(() => requested.some((url) => folded.some((prefix) => url.startsWith(prefix)))).toBe(true);
    });

    test('opens and closes by keyboard, and the control then says to hide them', async ({ page }) => {
      await page.goto(path);
      test.skip((await page.locator('.more').count()) === 0, 'no fold until there are more apartments than are shown');
      const total = await page.locator('#cabins .row').count();
      const summary = page.locator('.more__summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.more')).toHaveAttribute('open', '');
      await expect(page.locator('#cabins .row:visible')).toHaveCount(total);
      await expect(page.locator('.more__hide')).toHaveText(hide);
      await expect(page.locator('.more__hide')).toBeVisible();
      await expect(page.locator('.more__show')).toBeHidden();
      await expect(summary).toBeFocused();
      await page.keyboard.press('Space');
      await expect(page.locator('.more')).not.toHaveAttribute('open', '');
      await expect(page.locator('.more__show')).toBeVisible();
    });

    test('has no axe violations while open', async ({ page }) => {
      await page.goto(path);
      test.skip((await page.locator('.more').count()) === 0, 'no fold until there are more apartments than are shown');
      await page.locator('.more__summary').click();
      expect(await axeViolations(page)).toEqual([]);
    });
  });
}

test.describe('the fold of the home page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('still opens, and shows every apartment', async ({ page }) => {
    await page.goto('/');
    test.skip((await page.locator('.more').count()) === 0, 'no fold until there are more apartments than are shown');
    const total = await page.locator('#cabins .row').count();
    await expect(page.locator('#cabins .row:visible')).toHaveCount(ROWS_SHOWN);
    await page.locator('.more__summary').click();
    await expect(page.locator('#cabins .row:visible')).toHaveCount(total);
  });
});
