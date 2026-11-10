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
  /** "Guests: {count} ({detail})", when the total was worked out from couples and children. */
  guestsDetail: string;
  /** "1 couple" */
  couplesOne: string;
  /** "{count} couples" */
  couplesMany: string;
  /** "1 child" */
  childOne: string;
  /** "{count} children" */
  childMany: string;
  /** "Flexible dates: ±1 day" */
  flexOne: string;
  /** "Flexible dates: ±{count} days" */
  flexMany: string;
  /** "Name: {name}" */
  name: string;
  /** The same without a name: ends with a colon and a space for the guest to write it in the app. */
  namePlaceholder: string;
  /** "Booking request - {cabin}" */
  subject: string;
}

/** The dates a guest chose, already formatted for reading; either may be missing. */
export interface ChosenDates {
  from: string | null;
  to: string | null;
  nights: number | null;
}

/** What the message adds beside the apartment, the dates and the total (all optional). */
export interface MessageExtras {
  /**
   * The name line. Left out when the field is absent (a page without a name field); an empty string writes the line with
   * nothing after the colon, for the guest to fill in the app; a name (already cleaned, `cleanName`) is written after it.
   */
  name?: string;
  /** How many days either side of the dates the guest could move; 0 or missing writes no line. */
  flexDays?: number;
  /** The couples and children the total was worked out from; left out when the guest typed their own total. */
  split?: { couples: number; children: number };
}

/** The words for a split: "2 couples, 1 child"; a part that is 0 is left out. */
function splitDetail(texts: BookingTexts, split: { couples: number; children: number }): string {
  const parts: string[] = [];
  if (split.couples > 0) {
    parts.push(split.couples === 1 ? texts.couplesOne : fillTemplate(texts.couplesMany, { count: split.couples }));
  }
  if (split.children > 0) {
    parts.push(split.children === 1 ? texts.childOne : fillTemplate(texts.childMany, { count: split.children }));
  }
  return parts.join(', ');
}

/**
 * Builds the pre-filled message. It holds only what the guest typed into the request (a name, the dates, the guests); the
 * site keeps none of it.
 */
export function buildBookingMessage(
  texts: BookingTexts,
  cabinName: string | null,
  guests: number | null,
  dates: ChosenDates = { from: null, to: null, nights: null },
  extras: MessageExtras = {},
): string {
  const lines = [cabinName ? fillTemplate(texts.intro, { cabin: cabinName }) : texts.introAny];
  if (extras.name !== undefined) {
    lines.push(extras.name === '' ? texts.namePlaceholder : fillTemplate(texts.name, { name: extras.name }));
  }
  if (dates.from && dates.to && dates.nights) {
    const nights = dates.nights === 1 ? texts.oneNight : fillTemplate(texts.nights, { count: dates.nights });
    lines.push(fillTemplate(texts.dates, { from: dates.from, to: dates.to, nights }));
  } else if (dates.from) {
    lines.push(fillTemplate(texts.checkIn, { from: dates.from }));
  } else {
    lines.push(texts.datesPlaceholder);
  }
  if (dates.from && extras.flexDays && extras.flexDays > 0) {
    lines.push(extras.flexDays === 1 ? texts.flexOne : fillTemplate(texts.flexMany, { count: extras.flexDays }));
  }
  if (guests) {
    const detail = extras.split ? splitDetail(texts, extras.split) : '';
    lines.push(
      detail
        ? fillTemplate(texts.guestsDetail, { count: guests, detail })
        : fillTemplate(texts.guests, { count: guests }),
    );
  }
  return lines.join('\n');
}

/** Builds the subject line of the booking email. */
export function buildBookingSubject(texts: BookingTexts, cabinName: string | null): string {
  return fillTemplate(texts.subject, { cabin: cabinName ?? '' }).replace(/\s*-\s*$/, '');
}
