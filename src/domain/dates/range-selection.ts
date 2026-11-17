import { countNights } from './date-range';
import type { DateKey } from './date-key';

/** The stay a guest is choosing: a check-in, and a check-out once the second day is picked. */
export interface Range {
  start: DateKey | null;
  end: DateKey | null;
}

/** Nothing chosen yet. */
export const EMPTY_RANGE: Range = { start: null, end: null };

/**
 * What a click on a day does. With nothing chosen, or a finished range, the day becomes a new check-in. With only a
 * check-in, a later day becomes the check-out; the same day or an earlier one becomes the new check-in instead, so the
 * check-out is always after the check-in and there is no error to show.
 */
export function pickDay(range: Range, day: DateKey): Range {
  if (!range.start || range.end) return { start: day, end: null };
  if (day <= range.start) return { start: day, end: null };
  return { start: range.start, end: day };
}

/** Tells whether a day lies between the check-in and the check-out (the ends themselves are not in between). */
export function isBetween(range: Range, day: DateKey): boolean {
  return Boolean(range.start && range.end && day > range.start && day < range.end);
}

/** The number of nights of a finished range, or null while the check-out is missing. */
export function rangeNights(range: Range): number | null {
  return range.start && range.end ? countNights(range.start, range.end) : null;
}
