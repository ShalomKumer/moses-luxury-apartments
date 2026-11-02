import { buildBookingMessage } from '@domain/booking/booking-message';
import { applyMessage, readLinkTarget } from './booking-links';

/** Starts a booking panel: keeps the links current when the guest count changes. Without it the plain links still work. */
export function initBookingPanel(root: HTMLElement): void {
  const guests = root.querySelector<HTMLSelectElement>('[data-booking-guests]');
  const target = readLinkTarget(root);
  if (!guests || !target) return;
  const update = () =>
    applyMessage(root, target, buildBookingMessage(target.texts, target.cabinName, Number(guests.value) || null));
  guests.addEventListener('change', update);
  update();
}
