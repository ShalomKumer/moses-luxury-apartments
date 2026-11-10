// The booking and contact links in a real browser: WhatsApp and Gmail open in a new tab with the ready message, a plain
// mailto link stays for a mail app, phone numbers dial with `tel:`, and the icons beside the words are decoration.
import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', label: 'Hebrew home' },
  { path: '/en/', label: 'English home' },
  { path: '/cabins/artist-estate/', label: 'Hebrew apartment' },
  { path: '/en/cabins/artist-estate/', label: 'English apartment' },
];

for (const { path, label } of PAGES) {
  test.describe(`booking links, ${label}`, () => {
    test('WhatsApp and Gmail open in a new tab and cannot reach back into the site', async ({ page }) => {
      await page.goto(path);
      for (const selector of ['[data-booking-whatsapp]', '[data-booking-gmail]']) {
        const link = page.locator(`[data-request-bar] ${selector}`);
        await expect(link).toHaveAttribute('target', '_blank');
        const rel = (await link.getAttribute('rel')) ?? '';
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
      }
    });

    test('the Gmail link carries the same message as the preview, and the mail-app link stays a mailto', async ({
      page,
    }) => {
      await page.goto(path);
      const preview = (await page.locator('[data-request-message]').textContent()) ?? '';
      const gmail = new URL((await page.locator('[data-request-bar] [data-booking-gmail]').getAttribute('href')) ?? '');
      expect(gmail.origin + gmail.pathname).toBe('https://mail.google.com/mail/');
      expect(gmail.searchParams.get('view')).toBe('cm');
      expect(gmail.searchParams.get('to')).toMatch(/^[^@\s]+@[^@\s]+$/);
      expect(gmail.searchParams.get('body')).toBe(preview);
      expect(gmail.searchParams.get('su')).toBeTruthy();
      const mail = (await page.locator('[data-request-bar] [data-booking-email]').getAttribute('href')) ?? '';
      expect(mail.startsWith('mailto:')).toBe(true);
      await expect(page.locator('[data-request-bar] [data-booking-email]')).not.toHaveAttribute('target', /.+/);
    });

    test('the Gmail link follows the choices, like the WhatsApp link', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-request-guests]').fill('2');
      const preview = (await page.locator('[data-request-message]').textContent()) ?? '';
      const gmail = new URL((await page.locator('[data-request-bar] [data-booking-gmail]').getAttribute('href')) ?? '');
      expect(gmail.searchParams.get('body')).toBe(preview);
      expect(preview).toContain('2');
    });

    test('the footer phones dial with an international tel link and every icon is hidden from a screen reader', async ({
      page,
    }) => {
      await page.goto(path);
      const phones = page.locator('footer a[href^="tel:+972"]');
      expect(await phones.count()).toBeGreaterThan(0);
      const icons = page.locator('footer svg.icon, #contact svg.icon');
      const count = await icons.count();
      expect(count).toBeGreaterThan(0);
      for (let index = 0; index < count; index += 1) {
        await expect(icons.nth(index)).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });
}

test.describe('contact section', () => {
  test('opens WhatsApp and Gmail in a new tab, and the phones are tel links', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('#contact');
    for (const selector of ['a[href^="https://wa.me/"]', 'a[href^="https://mail.google.com/"]']) {
      const link = contact.locator(selector);
      await expect(link).toHaveAttribute('target', '_blank');
      expect((await link.getAttribute('rel')) ?? '').toContain('noreferrer');
    }
    expect(await contact.locator('a[href^="tel:+972"]').count()).toBeGreaterThan(0);
    expect(await contact.locator('a[href^="mailto:"]').count()).toBe(1);
  });
});
