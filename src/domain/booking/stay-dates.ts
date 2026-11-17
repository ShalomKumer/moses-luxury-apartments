import { isDateKey, type DateKey } from '../dates/date-key';
import { countNights } from '../dates/date-range';
import { formatDateKey } from '../dates/format-date';
import type { ChosenDates } from './booking-message';

/** Why the dates a guest typed are not used in the message; null when they are fine or still being typed. */
export type StayProblem = 'check-in-past' | 'check-out-not-after';

/** The dates of a stay as far as they are valid. They only write the message: no availability is looked up. */
export interface Stay {
  checkIn: DateKey | null;
  checkOut: DateKey | null;
  nights: number | null;
  problem: StayProblem | null;
}

const EMPTY_STAY: Stay = { checkIn: null, checkOut: null, nights: null, problem: null };

/** A date field's value as a key, or null when it is empty or not a real day. */
function asKey(value: string): DateKey | null {
  return isDateKey(value) ? value : null;
}

/**
 * Checks the two dates a guest chose against today's date (Israel). A check-in in the past is left out, and so is the
 * check-out that goes with it. A check-out that is not after the check-in is left out and the check-in stays. A
 * check-out on its own is ignored without a note: the guest is still typing.
 */
export function resolveStay(checkInValue: string, checkOutValue: string, today: DateKey): Stay {
  const checkIn = asKey(checkInValue);
  const checkOut = asKey(checkOutValue);
  if (!checkIn) return EMPTY_STAY;
  if (checkIn < today) return { ...EMPTY_STAY, problem: 'check-in-past' };
  if (!checkOut) return { ...EMPTY_STAY, checkIn };
  if (checkOut <= checkIn) return { ...EMPTY_STAY, checkIn, problem: 'check-out-not-after' };
  return { checkIn, checkOut, nights: countNights(checkIn, checkOut), problem: null };
}

/** The stay written the way the message shows it: "05.11.2026". */
export function toChosenDates(stay: Stay): ChosenDates {
  return {
    from: stay.checkIn ? formatDateKey(stay.checkIn) : null,
    to: stay.checkOut ? formatDateKey(stay.checkOut) : null,
    nights: stay.nights,
  };
}
