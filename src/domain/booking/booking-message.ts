import { fillTemplate } from '../text/fill-template';

/**
 * The texts of the booking message, in the page's language, with {cabin} and {count} slots. The site shows no
 * availability, so the guest writes the dates after the colon unless the page filled them in.
 */
export interface BookingTexts {
  /** "Hello, I'd like to check availability and book {cabin}." */
  intro: string;
  /** The same without an apartment, for the home page. */
  introAny: string;
  /** The dates line when no dates were chosen: ends with a colon and a space for the guest to write. */
  datesPlaceholder: string;
  /** "Dates: {from} to {to} ({nights})" */
  dates: string;
  /** "Check-in: {from}" */
  checkIn: string;
  oneNight: string;
  /** "{count} nights" */
  nights: string;
  /** "Guests: {count}" */
  guests: string;
  /** "Booking request - {cabin}" */
  subject: string;
}

/** The dates a guest chose, already formatted for reading; either may be missing. */
export interface ChosenDates {
  from: string | null;
  to: string | null;
  nights: number | null;
}

/** Builds the pre-filled message. It holds no personal data. */
export function buildBookingMessage(
  texts: BookingTexts,
  cabinName: string | null,
  guests: number | null,
  dates: ChosenDates = { from: null, to: null, nights: null },
): string {
  const lines = [cabinName ? fillTemplate(texts.intro, { cabin: cabinName }) : texts.introAny];
  if (dates.from && dates.to && dates.nights) {
    const nights = dates.nights === 1 ? texts.oneNight : fillTemplate(texts.nights, { count: dates.nights });
    lines.push(fillTemplate(texts.dates, { from: dates.from, to: dates.to, nights }));
  } else if (dates.from) {
    lines.push(fillTemplate(texts.checkIn, { from: dates.from }));
  } else {
    lines.push(texts.datesPlaceholder);
  }
  if (guests) lines.push(fillTemplate(texts.guests, { count: guests }));
  return lines.join('\n');
}

/** Builds the subject line of the booking email. */
export function buildBookingSubject(texts: BookingTexts, cabinName: string | null): string {
  return fillTemplate(texts.subject, { cabin: cabinName ?? '' }).replace(/\s*-\s*$/, '');
}
