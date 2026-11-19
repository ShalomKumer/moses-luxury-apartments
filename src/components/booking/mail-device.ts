import { isPhoneOrTablet } from '@domain/booking/phone-or-tablet';

/**
 * Whether the email button should open the mail app (`mailto:`): on a phone or a tablet, where it opens a new message. A
 * computer gets Gmail's compose window instead, by its operating system and not by its screen: a computer with a touch
 * screen reports a finger as its way of pointing, and a `mailto:` link there does nothing when no mail app is set up.
 */
export function prefersMailApp(): boolean {
  return isPhoneOrTablet({ userAgent: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints });
}
