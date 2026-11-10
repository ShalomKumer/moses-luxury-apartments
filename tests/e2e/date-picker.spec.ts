// The date picker of the booking request (2026-11-10), in a real browser: one field "When?" that opens a calendar,
// "from date to date", only to fill the dates of the message. A desktop shows two months, a phone one. Past days and days
// more than a year ahead cannot be chosen; the flexibility buttons add a line to the message; the keys follow the
// page's direction; nothing is stored; and the calendar never says a day is free or taken (H7, L3, A3).
import { expect, test, type Page } from '@playwright/test';
import { clickDay, dayFromNow, openPicker, pickStay, showDay } from './helpers/date-picker';
import { axeViolations } from './helpers/run-axe';

const LOCALES = [
  {
    label: 'Hebrew',
    home: '/',
    apartment: '/cabins/nobility-1/',
    rtl: true,
    firstWeekday: 'יום ראשון',
    threeNights: '3 לילות',
    inStay: 'בתוך השהייה',
    flexTwo: 'גמישות בתאריכים: ±2 ימים',
    flexLine: /גמישות בתאריכים/,
    placeholder: 'בחירת תאריכים',
    wording: /פנוי|תפוס|זמין/,
  },
  {
    label: 'English',
    home: '/en/',
    apartment: '/en/cabins/nobility-1/',
    rtl: false,
    firstWeekday: 'Sunday',
    threeNights: '3 nights',
    inStay: 'in your stay',
    flexTwo: 'Flexible dates: ±2 days',
    flexLine: /Flexible dates/,
    placeholder: 'Choose dates',
    wording: /free|taken|available|availability|vacant|booked/i,
  },
];

const message = async (page: Page) => (await page.locator('[data-request-message]').textContent()) ?? '';
const summary = (page: Page) => page.locator('[data-request-bar] [data-picker-summary]');
const dialog = (page: Page) => page.locator('[data-request-bar] [data-picker-dialog]');

for (const {
  label,
  home,
  apartment,
  rtl,
  firstWeekday,
  threeNights,
  inStay,
  flexTwo,
  flexLine,
  placeholder,
  wording,
} of LOCALES) {
  test.describe(`the date picker, ${label}`, () => {
    test('the field says "choose dates" and the message leaves the dates to fill in', async ({ page }) => {
      await page.goto(home);
      await expect(summary(page)).toHaveText(placeholder);
      await expect(page.locator('[data-stay-in]')).toHaveValue('');
      expect(await message(page)).not.toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    test('opens with two months on a wide screen and one on a phone, starting from the current month', async ({
      page,
      viewport,
    }) => {
      await page.goto(home);
      await openPicker(page);
      const wide = (viewport?.width ?? 0) >= 768;
      await expect(page.locator('[data-picker-months] .cal')).toHaveCount(wide ? 2 : 1);
      await expect(page.locator(`[data-picker-months] [data-date="${dayFromNow(0)}"]`)).toBeEnabled();
      await expect(page.locator('[data-picker-prev]')).toHaveAttribute('aria-disabled', 'true');
    });

    test('draws Sunday first, with the full day name for a screen reader', async ({ page }) => {
      await page.goto(home);
      await openPicker(page);
      const first = page.locator('[data-picker-months] .cal__weekday').first();
      await expect(first).toHaveAttribute('abbr', firstWeekday);
    });

    test('the first click is the check-in and the second the check-out; the field and the message show the stay', async ({
      page,
    }) => {
      await page.goto(home);
      await pickStay(page, 10, 13);
      await expect(summary(page)).toContainText(threeNights);
      await expect(page.locator('[data-stay-in]')).toHaveValue(dayFromNow(10));
      await expect(page.locator('[data-stay-out]')).toHaveValue(dayFromNow(13));
      expect(await message(page)).toMatch(/\d{2}\.\d{2}\.\d{4}.*\d{2}\.\d{2}\.\d{4}/);
      // the two ends are filled and the nights between them shaded (a month turned, so only what is drawn is checked)
      await openPicker(page);
      await expect(page.locator(`[data-date="${dayFromNow(10)}"]`)).toHaveAttribute('data-edge', 'start');
      // a day between the ends is said to be in the stay in words too, not by its shading alone
      await showDay(page, dayFromNow(11));
      await expect(page.locator(`[data-date="${dayFromNow(11)}"]`)).toHaveAttribute('aria-label', new RegExp(inStay));
    });

    test('a click on the check-in again, or on an earlier day, starts over with that day', async ({ page }) => {
      await page.goto(home);
      await openPicker(page);
      await clickDay(page, dayFromNow(12));
      await clickDay(page, dayFromNow(12));
      await expect(page.locator('[data-stay-out]')).toHaveValue('');
      await clickDay(page, dayFromNow(9));
      await expect(page.locator('[data-stay-in]')).toHaveValue(dayFromNow(9));
      await expect(page.locator('[data-stay-out]')).toHaveValue('');
      await expect(page.locator('[data-picker-hint]')).not.toBeEmpty();
    });

    test('the flexibility buttons add a line to the message; exact dates and Clear take it away', async ({ page }) => {
      await page.goto(home);
      await pickStay(page, 10, 13);
      expect(await message(page)).not.toMatch(flexLine);
      await openPicker(page);
      await page.locator('[data-flex="2"]').click();
      await expect(page.locator('[data-flex="2"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-flex="0"]')).toHaveAttribute('aria-pressed', 'false');
      expect(await message(page)).toContain(flexTwo);
      await page.locator('[data-flex="0"]').click();
      expect(await message(page)).not.toMatch(flexLine);
      await page.locator('[data-flex="7"]').click();
      await page.locator('[data-picker-clear]').click();
      await expect(page.locator('[data-flex="0"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(summary(page)).toHaveText(placeholder);
      expect(await message(page)).not.toMatch(flexLine);
      expect(await message(page)).not.toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    test('the keys follow the direction of the page, Enter chooses, and Escape closes with the focus back on the field', async ({
      page,
    }) => {
      await page.goto(home);
      await openPicker(page);
      const focusedDay = () =>
        page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.date ?? null);
      expect(await focusedDay()).toBe(dayFromNow(0));
      // the arrow that points the way the days run: left in a right-to-left page
      await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight');
      expect(await focusedDay()).toBe(dayFromNow(1));
      await page.keyboard.press('ArrowDown');
      expect(await focusedDay()).toBe(dayFromNow(8));
      await page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft');
      expect(await focusedDay()).toBe(dayFromNow(7));
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-stay-in]')).toHaveValue(dayFromNow(7));
      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();
      await expect(page.locator('[data-picker-open]')).toBeFocused();
    });

    test('Page Down moves a month and keeps the focus on a day that is on screen', async ({ page }) => {
      await page.goto(home);
      await openPicker(page);
      await page.keyboard.press('PageDown');
      const focused = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.date ?? '');
      expect(focused > dayFromNow(27) && focused < dayFromNow(34)).toBe(true);
      await expect(page.locator(`[data-picker-months] [data-date="${focused}"]`)).toBeFocused();
    });

    test('shows no day as free or taken, and the open calendar has no axe violations', async ({ page }) => {
      await page.goto(home);
      await openPicker(page);
      await expect(dialog(page)).not.toContainText(wording);
      expect(await axeViolations(page)).toEqual([]);
      await page.locator('[data-flex="3"]').click();
      expect(await axeViolations(page)).toEqual([]);
    });

    test('goes no further than a year ahead: the arrow stops and the last day is the same date next year', async ({
      page,
    }) => {
      await page.goto(home);
      await openPicker(page);
      const next = page.locator('[data-picker-next]');
      for (let turn = 0; turn < 14 && (await next.getAttribute('aria-disabled')) !== 'true'; turn += 1) {
        await next.click();
      }
      await expect(next).toHaveAttribute('aria-disabled', 'true');
      const [year, rest] = [Number(dayFromNow(0).slice(0, 4)), dayFromNow(0).slice(4)];
      const last = `${year + 1}${rest}`;
      const lastDay = page.locator(`[data-picker-months] [data-date="${last}"]`);
      if ((await lastDay.count()) > 0) await expect(lastDay).toBeEnabled();
      const beyond = page.locator(`[data-picker-months] [data-date="${year + 1}-${last.slice(5, 7)}-31"]`);
      if (last.slice(8) < '31' && (await beyond.count()) > 0) await expect(beyond).toBeDisabled();
    });

    test('stores nothing: no cookie and no browser storage after a stay is chosen', async ({ page, context }) => {
      await page.goto(home);
      await pickStay(page, 10, 13);
      const stored = await page.evaluate(() => [localStorage.length, sessionStorage.length]);
      expect(stored).toEqual([0, 0]);
      expect(await context.cookies()).toEqual([]);
    });

    test('works the same on an apartment page, where the apartment is already named', async ({ page }) => {
      await page.goto(apartment);
      await pickStay(page, 14, 16);
      expect(await message(page)).toMatch(/\d{2}\.\d{2}\.\d{4}.*\d{2}\.\d{2}\.\d{4}/);
      await expect(summary(page)).not.toHaveText(placeholder);
    });

    test('fits the screen, and a day is at least 44 px to touch', async ({ page, viewport }) => {
      await page.goto(home);
      await openPicker(page);
      const box = await dialog(page).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport?.width ?? 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const day = await page.locator(`[data-picker-months] [data-date="${dayFromNow(0)}"]`).boundingBox();
      expect(day!.height).toBeGreaterThanOrEqual(44);
      expect(day!.width).toBeGreaterThanOrEqual(44);
    });
  });
}
