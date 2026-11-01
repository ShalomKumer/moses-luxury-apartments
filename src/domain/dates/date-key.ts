/** A calendar day as "YYYY-MM-DD". Strings of this shape sort in date order. */
export type DateKey = string;

export const SITE_TIME_ZONE = 'Asia/Jerusalem';

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const keyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Returns the day an instant falls on in Israel. */
export function toDateKey(instant: Date): DateKey {
  return keyFormatter.format(instant);
}

/** Builds a key from calendar parts (month is 1-12). */
export function dateKeyFromParts(year: number, month: number, day: number): DateKey {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Splits a key into its calendar parts (month is 1-12). */
export function dateKeyParts(key: DateKey): { year: number; month: number; day: number } {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
}

/** Tells whether a value is a real calendar day in "YYYY-MM-DD" form. */
export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string') return false;
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;
  const { year, month, day } = dateKeyParts(value);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

/** Returns the key a number of days after (or before, if negative) the given key. */
export function addDays(key: DateKey, days: number): DateKey {
  const { year, month, day } = dateKeyParts(key);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return dateKeyFromParts(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

/** Returns the day of the week of a key, 0 for Sunday to 6 for Saturday. */
export function weekday(key: DateKey): number {
  const { year, month, day } = dateKeyParts(key);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
