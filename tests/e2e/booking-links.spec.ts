// The booking and contact links in a real browser: WhatsApp opens in a new tab with the ready message; the email button opens a
// new message in the mail app on a phone (`mailto:`, the user's decision of 2026-11-18, which reverses the removal of the
// mail-app link of 2026-11-10) and Gmail's compose window in a new tab on a computer; the contact section and the footer
// carry only the plain address link; phone numbers dial with `tel:`; the icons beside the words are decoration.
import { expect, test } from '@playwright/test';
import { bookingMessage, emailLink } from './helpers/booking-message';

const PAGES = [
  { path: '/', label: 'Hebrew home' },
  { path: '/en/', label: 'English home' },
  { path: '/cabins/artist-estate/', label: 'Hebrew apartment' },
  { path: '/en/cabins/artist-estate/', label: 'English apartment' },
];

for (const { path, label } of PAGES) {
  test.describe(`booking links, ${label}`, () => {
    test('WhatsApp opens in a new tab and cannot reach back into the site', async ({ page }) => {
      await page.goto(path);
      const link = page.locator('[data-request-bar] [data-booking-whatsapp]');
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });

    test('the email button opens a mail app message on a phone and a Gmail tab on a computer, with the same message', async ({
      page,
    }, testInfo) => {
      await page.goto(path);
      const email = page.locator('[data-request-bar] [data-booking-email]');
      const link = await emailLink(page);
      expect(link.body).toBe(await bookingMessage(page));
      expect(link.to).toMatch(/^[^@\s]+@[^@\s]+$/);
      expect(link.subject).toBeTruthy();
      if (testInfo.project.name === 'phone') {
        expect(link.kind).toBe('mailto');
        await expect(email).not.toHaveAttribute('target', /.+/);
        await expect(email.locator('[data-new-tab-hint]')).toBeHidden();
      } else {
        expect(link.kind).toBe('gmail');
        const href = new URL((await email.getAttribute('href')) ?? '');
        expect(href.origin + href.pathname).toBe('https://mail.google.com/mail/');
        expect(href.searchParams.get('view')).toBe('cm');
        await expect(email).toHaveAttribute('target', '_blank');
        expect((await email.getAttribute('rel')) ?? '').toContain('noreferrer');
        await expect(email.locator('[data-new-tab-hint]')).toBeAttached();
      }
      await expect(email).toContainText(/אימייל|email/i);
      await expect(page.locator('[data-request-bar] .booking-notice')).toHaveCount(0);
    });

    test('the email link follows the choices, like the WhatsApp link', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-request-guests]').fill('2');
      const message = await bookingMessage(page);
      expect((await emailLink(page)).body).toBe(message);
      expect(message).toContain('2');
    });

    test('the footer phones dial with an international tel link and every icon is hidden from a screen reader', async ({
      page,
    }) => {
      await page.goto(path);
      const phones = page.locator('footer a[href^="tel:+972"]');
      await expect(phones).toHaveCount(1);
      await expect(phones).toHaveAttribute('href', 'tel:+972534369490');
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
  test('opens WhatsApp in a new tab, shows the plain address only (no Gmail link), and the phones are tel links', async ({
    page,
  }) => {
    await page.goto('/');
    const contact = page.locator('#contact');
    const whatsapp = contact.locator('a[href^="https://wa.me/"]');
    await expect(whatsapp).toHaveAttribute('target', '_blank');
    expect((await whatsapp.getAttribute('rel')) ?? '').toContain('noreferrer');
    await expect(
      page.locator('#contact a[href^="https://mail.google.com/"], footer a[href^="https://mail.google.com/"]'),
    ).toHaveCount(0);
    await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(page.locator('footer a[href^="mailto:"]')).toHaveCount(1);
    // the one number the business keeps: dialled, and the WhatsApp link goes to it
    await expect(contact.locator('a[href^="tel:+972"]')).toHaveCount(1);
    await expect(contact.locator('a[href^="tel:+972"]')).toHaveAttribute('href', 'tel:+972534369490');
    expect((await contact.locator('a[href^="https://wa.me/"]').getAttribute('href')) ?? '').toContain(
      'wa.me/972534369490',
    );
    expect(await contact.locator('a[href^="mailto:"]').count()).toBe(1);
  });
});
