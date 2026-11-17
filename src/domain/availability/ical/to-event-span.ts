import { addDays } from '../../dates/date-key';
import type { EventSpan } from '../types';
import { parseIcalDate } from './parse-ical-date';

/** Returns the line of a property by name ("DTSTART" matches "DTSTART;VALUE=DATE:..."), or undefined. */
function findProperty(block: string[], name: string): string | undefined {
  const prefix = name.toUpperCase();
  return block.find((line) => {
    const upper = line.toUpperCase();
    return upper.startsWith(`${prefix}:`) || upper.startsWith(`${prefix};`);
  });
}

/** Tells whether the event was cancelled, and so blocks nothing. */
function isCancelled(block: string[]): boolean {
  return findProperty(block, 'STATUS')?.toUpperCase().endsWith(':CANCELLED') ?? false;
}

/**
 * Reduces one VEVENT to the days it covers. Only DTSTART, DTEND and STATUS are read:
 * the title, description, location and attendees may hold a guest's details and are never touched (L8).
 * A timed event always covers at least the night of its start day.
 */
export function toEventSpan(block: string[]): EventSpan | null {
  if (isCancelled(block)) return null;
  const startLine = findProperty(block, 'DTSTART');
  const start = startLine ? parseIcalDate(startLine) : null;
  if (!start) return null;
  const endLine = findProperty(block, 'DTEND');
  const end = endLine ? parseIcalDate(endLine) : null;
  const minimumEnd = addDays(start.day, 1);
  const endDay = end && end.day > start.day ? end.day : minimumEnd;
  return { start: start.day, end: endDay };
}
