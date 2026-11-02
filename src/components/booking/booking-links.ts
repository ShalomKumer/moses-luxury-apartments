import { buildBookingSubject, type BookingTexts } from '@domain/booking/booking-message';
import { mailtoLink } from '@domain/booking/mailto-link';
import { whatsappLink } from '@domain/booking/whatsapp-link';

/** What the two booking links need besides the message: where they go and the texts of the subject line. */
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

/** Points the WhatsApp and email links inside the element at the message. Without a script the plain links still work. */
export function applyMessage(root: HTMLElement, target: LinkTarget, message: string): void {
  const whatsapp = root.querySelector<HTMLAnchorElement>('[data-booking-whatsapp]');
  const email = root.querySelector<HTMLAnchorElement>('[data-booking-email]');
  if (whatsapp && target.phoneDigits) whatsapp.href = whatsappLink(target.phoneDigits, message);
  if (email) email.href = mailtoLink(target.email, buildBookingSubject(target.texts, target.cabinName), message);
}
