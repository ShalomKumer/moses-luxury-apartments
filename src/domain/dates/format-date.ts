import { dateKeyParts, SITE_TIME_ZONE, type DateKey } from './date-key';

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const HEBREW_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

/** Formats a key as "05.11.2026", the way dates are written in Israel. */
export function formatDateKey(key: DateKey): string {
  const { year, month, day } = dateKeyParts(key);
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

/** Returns the Hebrew name of a month (1-12), with the year: "נובמבר 2026". */
export function formatMonthTitle(year: number, month: number): string {
  return `${HEBREW_MONTHS[month - 1]} ${year}`;
}

/** Returns a spoken label for one day: "יום חמישי, 5 בנובמבר 2026". */
export function formatDayLabel(key: DateKey, weekdayIndex: number): string {
  const { year, month, day } = dateKeyParts(key);
  return `יום ${HEBREW_WEEKDAYS[weekdayIndex]}, ${day} ב${HEBREW_MONTHS[month - 1]} ${year}`;
}

const timeFormatter = new Intl.DateTimeFormat('he-IL', {
  timeZone: SITE_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Formats an ISO instant as the time of day in Israel: "10:05". */
export function formatTimeOfDay(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** Returns the short weekday letters for a calendar header, Sunday first. */
export function weekdayInitials(): string[] {
  return ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
}

/** Returns the full weekday names, Sunday first, for screen readers. */
export function weekdayNames(): string[] {
  return HEBREW_WEEKDAYS.map((name) => `יום ${name}`);
}
