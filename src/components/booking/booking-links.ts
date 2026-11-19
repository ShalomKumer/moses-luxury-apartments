import { buildBookingSubject, type BookingTexts } from '@domain/booking/booking-message';
import { gmailComposeLink } from '@domain/booking/gmail-link';
import { mailtoLink } from '@domain/booking/mailto-link';
import { whatsappLink } from '@domain/booking/whatsapp-link';
import { prefersMailApp } from './mail-device';

/** What the booking links need besides the message: where they go and the texts of the subject line. */
export interface LinkTarget {
  /** The apartment's name for the subject line; null on the home page before one is chosen. */
  cabinName: string | null;
  phoneDigits: string | null;
  email: string;
  texts: BookingTexts;
}

/** The target as the page wrote it on an element's data attributes; null when the texts are unreadable. */
export function readLinkTarget(root: HTMLElement): LinkTarget | null {
  const data = root.dataset;
  try {
    const texts = JSON.parse(data.texts ?? '') as BookingTexts;
    return { cabinName: data.cabinName || null, phoneDigits: data.phoneDigits || null, email: data.email ?? '', texts };
  } catch {
    return null;
  }
}

/**
 * Points the WhatsApp and email links inside the element at the message. The email link opens a new message in the mail app
 * on a phone (`mailto:`), and Gmail's compose window in a new tab on a computer; the page writes the `mailto:` form, so
 * without a script the plain link still works.
 */
export function applyMessage(root: HTMLElement, target: LinkTarget, message: string): void {
  const whatsapp = root.querySelector<HTMLAnchorElement>('[data-booking-whatsapp]');
  const email = root.querySelector<HTMLAnchorElement>('[data-booking-email]');
  const hint = root.querySelector<HTMLElement>('[data-new-tab-hint]');
  const subject = buildBookingSubject(target.texts, target.cabinName);
  if (whatsapp && target.phoneDigits) whatsapp.href = whatsappLink(target.phoneDigits, message);
  if (!email) return;
  if (prefersMailApp()) {
    email.href = mailtoLink(target.email, subject, message);
    email.removeAttribute('target');
    email.removeAttribute('rel');
    if (hint) hint.hidden = true;
  } else {
    email.href = gmailComposeLink(target.email, subject, message);
    email.target = '_blank';
    email.rel = 'noopener noreferrer';
    if (hint) hint.hidden = false;
  }
}
