/** What a browser says about the device it runs on. */
export interface DeviceHints {
  /** the browser's user-agent string; empty when the browser says nothing. */
  userAgent: string;
  /** the number of touch points the browser reports: how many fingers the screen reads at once (0 without a touch screen). */
  maxTouchPoints: number;
}

const PHONE_OR_TABLET = /Android|iPhone|iPad|iPod/i;

/**
 * Whether the device is a phone or a tablet, by its operating system and not by its screen: there a `mailto:` link opens the
 * mail app with a new message. A computer is not, even one with a touch screen (a Windows laptop, a touch all-in-one) or in
 * tablet mode: it often has no mail app set up, so a `mailto:` link does nothing, while a browser signed in to Gmail can open its
 * compose form. An iPad that presents itself as a Mac (iPadOS) is told apart from a real Mac by its touch screen.
 */
export function isPhoneOrTablet({ userAgent, maxTouchPoints }: DeviceHints): boolean {
  if (PHONE_OR_TABLET.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}
