/**
 * The business behind the site: what does not depend on the language. The words (the brand's name and lines, the
 * placeholders for the business details) live in `src/i18n/messages`. Every placeholder is filled with the owner's real
 * details before launch; `npm run launch:check` fails while any is left (L11).
 */
export const SITE = {
  /**
   * The owner's logo, cut from the file the user sent on 2026-11-08 (docs/design/brand/logo-combined-original.png) by
   * with `npm run brand:build`: the whole lockup for the contact area, and the roof with both names for the top of the page.
   * The sizes are those of the files (tests/unit/config/logo-files.test.ts fails when they differ).
   */
  logo: {
    full: { src: '/brand/logo-full.webp', width: 720, height: 666 },
    name: { src: '/brand/logo-name.webp', width: 520, height: 252 },
  },
  /**
   * The phone numbers (given by the user, 2026-10-31; both are on WhatsApp, the user, 2026-11-03). The first marked
   * `whatsapp` receives the booking messages.
   */
  phones: [
    { display: '054-549-9445', whatsapp: true },
    { display: '053-436-9490', whatsapp: true },
  ],
  /** The booking email (given by the user, 2026-10-31). */
  email: 'Mnm783@gmail.com',
  /**
   * The accessibility coordinator (A6), shown on the accessibility statement. A null is a part still to fill; every
   * one is filled with the owner's real details before launch (`npm run launch:check` fails while a null is left).
   */
  accessibilityCoordinator: {
    name: null as string | null,
    phone: null as string | null,
    email: null as string | null,
    lastCheck: null as string | null,
  },
  /** Minimum age to book, the owner's rule (L10). To confirm with the owner. */
  minimumAge: 18,
  /**
   * Check-in and check-out times as "HH:MM", shown on the apartment pages. Null until the owner gives them (H1): the page
   * shows no time rather than a guess, and `npm run launch:check` fails while one is null.
   */
  checkInTime: null as string | null,
  checkOutTime: null as string | null,
  /** Links to the place on navigation apps; null until the address is known. */
  location: null as { waze: string; googleMaps: string } | null,
} as const;

/** The number that receives WhatsApp booking messages. */
export const WHATSAPP_PHONE: string = SITE.phones.find((phone) => phone.whatsapp)?.display ?? SITE.phones[0].display;
