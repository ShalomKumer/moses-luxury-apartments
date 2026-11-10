import { expect, type Page } from '@playwright/test';

/** A day offset from today as "YYYY-MM-DD", read as the site reads it (the day in Israel). */
export function dayFromNow(days: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(Date.now() + days * 86_400_000));
}

/** Opens the date picker's window from the field of the request bar. */
export async function openPicker(page: Page): Promise<void> {
  await page.locator('[data-request-bar] [data-picker-open]').click();
  await expect(page.locator('[data-request-bar] [data-picker-dialog]')).toBeVisible();
}

/** Turns the calendar forward until a day is on screen (a phone shows one month, a wide screen two). */
export async function showDay(page: Page, key: string): Promise<void> {
  const day = page.locator(`[data-request-bar] [data-picker-months] [data-date="${key}"]`);
  for (let turn = 0; turn < 14 && (await day.count()) === 0; turn += 1) {
    await page.locator('[data-request-bar] [data-picker-next]').click();
  }
  await expect(day).toBeVisible();
}

/** Clicks one day of the open calendar, turning to its month first. */
export async function clickDay(page: Page, key: string): Promise<void> {
  await showDay(page, key);
  await page.locator(`[data-request-bar] [data-picker-months] [data-date="${key}"]`).click();
}

/** Chooses a stay through the calendar like a guest does: open, check-in, check-out, done. */
export async function pickStay(page: Page, checkInOffset: number, checkOutOffset: number): Promise<void> {
  await openPicker(page);
  await clickDay(page, dayFromNow(checkInOffset));
  await clickDay(page, dayFromNow(checkOutOffset));
  await page.locator('[data-request-bar] [data-picker-done]').click();
  await expect(page.locator('[data-request-bar] [data-picker-dialog]')).toBeHidden();
}
