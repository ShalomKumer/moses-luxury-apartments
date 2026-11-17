import { addDays, type DateKey } from './date-key';

/** Lists the nights from check-in up to, not including, check-out. */
export function nightsBetween(checkIn: DateKey, checkOut: DateKey): DateKey[] {
  const nights: DateKey[] = [];
  for (let night = checkIn; night < checkOut; night = addDays(night, 1)) {
    nights.push(night);
  }
  return nights;
}

/** Counts the nights of a stay; zero when check-out is not after check-in. */
export function countNights(checkIn: DateKey, checkOut: DateKey): number {
  return nightsBetween(checkIn, checkOut).length;
}
