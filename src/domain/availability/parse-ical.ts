import { extractEventBlocks } from './ical/extract-events';
import { toEventSpan } from './ical/to-event-span';
import { unfoldLines } from './ical/unfold-lines';
import type { EventSpan } from './types';

/**
 * Turns an iCal feed into the day spans of its events. Recurring rules (RRULE) are not expanded:
 * a booking is a single event. Throws if the text is not a calendar at all.
 */
export function parseIcal(text: string): EventSpan[] {
  const lines = unfoldLines(text);
  if (lines[0]?.toUpperCase() !== 'BEGIN:VCALENDAR') throw new Error('not_a_calendar');
  return extractEventBlocks(lines)
    .map(toEventSpan)
    .filter((span): span is EventSpan => span !== null);
}
