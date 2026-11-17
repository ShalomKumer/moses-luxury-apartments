/**
 * The party that asks to book: couples, children and the total. A couple is two people and each child is one. Pure: the
 * form only reads what the guest typed and asks these functions what it means. The limits are the apartment's guests.
 */

/** People in one couple (the user's rule, 2026-11-08: a couple is two people). */
export const COUPLE_SIZE = 2;

/** The most digits a count may have: a count above this is a mistake, and the typed text is cut. */
const MAX_DIGITS = 3;

/** The number a guest typed in a counting field: its digits only; an empty field or one with no digits is 0. */
export function parseCount(raw: string): number {
  const digits = raw.replace(/\D/g, '').slice(0, MAX_DIGITS);
  return digits === '' ? 0 : Number(digits);
}

/** A count as a whole number of at least 0 (anything that is not a number is 0). */
function whole(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

/** Keeps a count between 0 and `max` (a `max` below 0 is 0). */
export function clampCount(value: number, max: number): number {
  return Math.min(whole(value), whole(max));
}

/** How many couples an apartment of `maxGuests` guests takes at most. */
export function maxCouples(maxGuests: number): number {
  return Math.floor(whole(maxGuests) / COUPLE_SIZE);
}

/** How many children fit beside `couples` couples in an apartment of `maxGuests` guests. */
export function maxChildren(maxGuests: number, couples: number): number {
  return whole(maxGuests - couples * COUPLE_SIZE);
}

/** The total of a party: two people for each couple and one for each child. */
export function totalOf(couples: number, children: number): number {
  return couples * COUPLE_SIZE + children;
}

/** The couples and children of a party after the apartment's limits are applied (couples first, the children take what is left). */
export interface LimitedParty {
  couples: number;
  children: number;
  /** True when a number had to be lowered to fit. */
  lowered: boolean;
}

/** Brings a party within an apartment of `maxGuests` guests, and says whether it had to be lowered. */
export function limitParty(couples: number, children: number, maxGuests: number): LimitedParty {
  const limitedCouples = clampCount(couples, maxCouples(maxGuests));
  const limitedChildren = clampCount(children, maxChildren(maxGuests, limitedCouples));
  return {
    couples: limitedCouples,
    children: limitedChildren,
    lowered: limitedCouples !== whole(couples) || limitedChildren !== whole(children),
  };
}

/** The total a guest typed, kept between 0 and the apartment's guests; 0 means "not chosen" (null). */
export function typedTotal(raw: string, maxGuests: number): number | null {
  const value = clampCount(parseCount(raw), maxGuests);
  return value === 0 ? null : value;
}
