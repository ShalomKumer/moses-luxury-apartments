import type { Page } from '@playwright/test';

/**
 * The booking message as the request has built it: read from the WhatsApp link of the page's booking bar (its `text`
 * parameter). The page shows no preview of it, so the link is where the message can be seen.
 */
export async function bookingMessage(page: Page): Promise<string> {
  const href = (await page.locator('[data-request-bar] [data-booking-whatsapp]').getAttribute('href')) ?? '';
  return new URL(href).searchParams.get('text') ?? '';
}

/** What the email button of the booking bar points at: Gmail's compose window (a computer) or a `mailto:` (a phone). */
export async function emailLink(
  page: Page,
): Promise<{ kind: 'gmail' | 'mailto'; to: string; subject: string; body: string }> {
  const href = (await page.locator('[data-request-bar] [data-booking-email]').getAttribute('href')) ?? '';
  const url = new URL(href);
  if (url.protocol === 'mailto:') {
    return {
      kind: 'mailto',
      to: decodeURIComponent(url.pathname),
      subject: url.searchParams.get('subject') ?? '',
      // a mail app wants CRLF; the message is compared with the WhatsApp text, which has plain new lines
      body: (url.searchParams.get('body') ?? '').replace(/\r\n/g, '\n'),
    };
  }
  return {
    kind: 'gmail',
    to: url.searchParams.get('to') ?? '',
    subject: url.searchParams.get('su') ?? '',
    body: url.searchParams.get('body') ?? '',
  };
}
