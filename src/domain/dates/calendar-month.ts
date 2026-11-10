import { dateKeyFromParts, dateKeyParts, weekday, type DateKey } from './date-key';
import { shiftMonth, type YearMonth } from './month';

/** How far ahead a guest can choose dates (the user's decision of 2026-11-09, question 13). */
export const MONTHS_AHEAD = 12;

/** Returns how many days a month has (month is 1-12). Leap years are handled by the calendar itself. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Returns the month a day falls in. */
export function monthOf(key: DateKey): YearMonth {
  const { year, month } = dateKeyParts(key);
  return { year, month };
}

/**
 * The weeks of a month for a calendar grid, Sunday first (also in English: the user's decision, question 14). A cell
 * outside the month is null, so every week has seven cells and the first and last weeks are padded.
 */
export function monthWeeks({ year, month }: YearMonth): (DateKey | null)[][] {
  const lead = weekday(dateKeyFromParts(year, month, 1));
  const cells: (DateKey | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth(year, month); day += 1) cells.push(dateKeyFromParts(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (DateKey | null)[][] = [];
  for (let start = 0; start < cells.length; start += 7) weeks.push(cells.slice(start, start + 7));
  return weeks;
}

/** The last day that can be chosen: the same day of the month, a year ahead (cut to the month's length). */
export function lastSelectableDay(today: DateKey): DateKey {
  const { year, month, day } = dateKeyParts(today);
  const target = shiftMonth({ year, month }, MONTHS_AHEAD);
  return dateKeyFromParts(target.year, target.month, Math.min(day, daysInMonth(target.year, target.month)));
}

/** Tells whether a day can be chosen: today or later, and not beyond the last day a year ahead. */
export function isSelectable(key: DateKey, today: DateKey): boolean {
  return key >= today && key <= lastSelectableDay(today);
}

/** Tells whether a month holds at least one day that can be chosen, so the arrows stop where there is nothing. */
export function monthIsReachable(target: YearMonth, today: DateKey): boolean {
  const first = dateKeyFromParts(target.year, target.month, 1);
  const last = dateKeyFromParts(target.year, target.month, daysInMonth(target.year, target.month));
  return last >= today && first <= lastSelectableDay(today);
}

/** A month as one number, so months compare and subtract. */
function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + month;
}

/**
 * Keeps the first month on screen where the calendar can show a day that can be chosen: not before this month, and not so
 * late that the months shown (one on a phone, two on a wide screen) run past the last month that holds a choosable day.
 */
export function clampViewMonth(candidate: YearMonth, today: DateKey, shown: number): YearMonth {
  const first = monthOf(today);
  const latestStart = shiftMonth(monthOf(lastSelectableDay(today)), -(shown - 1));
  if (monthIndex(candidate) < monthIndex(first)) return first;
  if (monthIndex(candidate) > monthIndex(latestStart))
    return monthIndex(latestStart) < monthIndex(first) ? first : latestStart;
  return candidate;
}

/** The first month to show so that a day is on screen: the current view when it already is, or the nearest view that has it. */
export function viewMonthFor(day: DateKey, view: YearMonth, today: DateKey, shown: number): YearMonth {
  const month = monthOf(day);
  if (monthIndex(month) < monthIndex(view)) return clampViewMonth(month, today, shown);
  if (monthIndex(month) > monthIndex(shiftMonth(view, shown - 1))) {
    return clampViewMonth(shiftMonth(month, -(shown - 1)), today, shown);
  }
  return view;
}
