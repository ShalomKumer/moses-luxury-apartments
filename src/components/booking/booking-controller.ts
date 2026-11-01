import { buildBookingMessage, buildBookingSubject, type BookingTexts } from '@domain/booking/booking-message';
import { mailtoLink } from '@domain/booking/mailto-link';
import { whatsappLink } from '@domain/booking/whatsapp-link';

/** The panel's settings, read from its data attributes. */
interface PanelSettings {
  cabinName: string;
  phoneDigits: string | null;
  email: string;
  texts: BookingTexts;
}

/** Reads the settings the page wrote on the panel, including the message texts in the page's language. */
function readSettings(root: HTMLElement): PanelSettings | null {
  const data = root.dataset;
  try {
    const texts = JSON.parse(data.texts ?? '') as BookingTexts;
    return { cabinName: data.cabinName ?? '', phoneDigits: data.phoneDigits || null, email: data.email ?? '', texts };
  } catch {
    return null;
  }
}

/** Rewrites the two links so the message carries the chosen number of guests. */
function updateLinks(root: HTMLElement, settings: PanelSettings, guests: number | null): void {
  const message = buildBookingMessage(settings.texts, settings.cabinName, guests);
  const whatsapp = root.querySelector<HTMLAnchorElement>('[data-booking-whatsapp]');
  const email = root.querySelector<HTMLAnchorElement>('[data-booking-email]');
  if (whatsapp && settings.phoneDigits) whatsapp.href = whatsappLink(settings.phoneDigits, message);
  if (email) email.href = mailtoLink(settings.email, buildBookingSubject(settings.texts, settings.cabinName), message);
}

/** Starts a booking panel: keeps the links current when the guest count changes. Without it the plain links still work. */
export function initBookingPanel(root: HTMLElement): void {
  const guests = root.querySelector<HTMLSelectElement>('[data-booking-guests]');
  const settings = readSettings(root);
  if (!guests || !settings) return;
  const update = () => updateLinks(root, settings, Number(guests.value) || null);
  guests.addEventListener('change', update);
  update();
}
