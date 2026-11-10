import { addDays, dateKeyFromParts, dateKeyParts, weekday, type DateKey } from './date-key';
import { daysInMonth, lastSelectableDay } from './calendar-month';
import { shiftMonth } from './month';

/** The keys that move between the days of the calendar. */
export const NAVIGATION_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
] as const;
export type NavigationKey = (typeof NAVIGATION_KEYS)[number];

/** Tells whether a key name is one of the calendar's movement keys. */
export function isNavigationKey(name: string): name is NavigationKey {
  return (NAVIGATION_KEYS as readonly string[]).includes(name);
}

/** The same day of another month, cut to that month's length ("31 January" plus a month is "28 February"). */
function shiftByMonths(day: DateKey, delta: number): DateKey {
  const { year, month, day: dayOfMonth } = dateKeyParts(day);
  const target = shiftMonth({ year, month }, delta);
  return dateKeyFromParts(target.year, target.month, Math.min(dayOfMonth, daysInMonth(target.year, target.month)));
}

/**
 * Where a movement key takes the focus. On the page the arrows follow what is drawn: in a right-to-left page the left
 * arrow is the next day. Up and down move a week; Home and End go to the start and the end of the week (Sunday and
 * Saturday); Page Up and Page Down a month. The result is held between today and the last day that can be chosen.
 */
export function navigate(current: DateKey, key: NavigationKey, rtl: boolean, today: DateKey): DateKey {
  const step = rtl ? -1 : 1;
  let target: DateKey;
  switch (key) {
    case 'ArrowRight':
      target = addDays(current, step);
      break;
    case 'ArrowLeft':
      target = addDays(current, -step);
      break;
    case 'ArrowDown':
      target = addDays(current, 7);
      break;
    case 'ArrowUp':
      target = addDays(current, -7);
      break;
    case 'Home':
      target = addDays(current, -weekday(current));
      break;
    case 'End':
      target = addDays(current, 6 - weekday(current));
      break;
    case 'PageUp':
      target = shiftByMonths(current, -1);
      break;
    case 'PageDown':
      target = shiftByMonths(current, 1);
      break;
  }
  const last = lastSelectableDay(today);
  if (target < today) return today;
  if (target > last) return last;
  return target;
}
