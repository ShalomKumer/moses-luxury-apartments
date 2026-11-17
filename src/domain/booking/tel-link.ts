import { toInternationalDigits } from './phone-number';

/** Builds a `tel:` link in international form from a written phone number, so a phone offers its normal call; null if the number cannot be read. */
export function telLink(phone: string): string | null {
  const digits = toInternationalDigits(phone);
  return digits ? `tel:+${digits}` : null;
}
