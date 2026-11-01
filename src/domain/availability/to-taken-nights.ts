import type { DateKey } from '../dates/date-key';
import { nightsBetween } from '../dates/date-range';
import type { EventSpan } from './types';

/** Lists every night an event covers, between from and to (to not included), sorted and without repeats. */
export function toTakenNights(spans: EventSpan[], from: DateKey, to: DateKey): DateKey[] {
  const taken = new Set<DateKey>();
  for (const span of spans) {
    const start = span.start > from ? span.start : from;
    const end = span.end < to ? span.end : to;
    for (const night of nightsBetween(start, end)) taken.add(night);
  }
  return [...taken].sort();
}
