import type { DateKey } from '../dates/date-key';

/** The days an event covers: from its start day to its end day, the end not included. */
export interface EventSpan {
  start: DateKey;
  end: DateKey;
}

/** What the site can say about one night. */
export type NightStatus = 'free' | 'taken' | 'unknown';

/** Why availability could not be given. */
export type UnknownReason = 'calendar_unavailable' | 'stale' | 'not_configured';

/** A reading of one cabin's calendar, as the API returns it. */
export type AvailabilityResult =
  | { status: 'known'; takenNights: DateKey[]; from: DateKey; to: DateKey; updatedAt: string }
  | { status: 'unknown'; reason: UnknownReason };
