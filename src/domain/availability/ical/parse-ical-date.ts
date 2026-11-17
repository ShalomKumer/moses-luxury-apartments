import { dateKeyFromParts, isDateKey, toDateKey, type DateKey } from '../../dates/date-key';

/** A DTSTART or DTEND value, reduced to the day it falls on. */
export interface IcalDate {
  day: DateKey;
  allDay: boolean;
}

const VALUE_PATTERN = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/;

/**
 * Reads a date property line ("DTSTART;VALUE=DATE:20261105", "DTEND:20261107T090000Z",
 * "DTSTART;TZID=Asia/Jerusalem:20261105T150000") as the day in Israel. Returns null if unreadable.
 * A time with a TZID or no zone is taken as local wall time, so its date part is the day.
 */
export function parseIcalDate(propertyLine: string): IcalDate | null {
  const separator = propertyLine.indexOf(':');
  if (separator < 0) return null;
  const match = VALUE_PATTERN.exec(propertyLine.slice(separator + 1).trim());
  if (!match) return null;
  const [, year, month, day, hour, minute, second, utc] = match;
  const allDay = hour === undefined;
  const parsedDay = utc
    ? toDateKey(new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)))
    : dateKeyFromParts(+year, +month, +day);
  return isDateKey(parsedDay) ? { day: parsedDay, allDay } : null;
}
