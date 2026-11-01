import { knownResult, unknownResult, withFreshness } from '@domain/availability/availability-result';
import { parseIcal } from '@domain/availability/parse-ical';
import { toTakenNights } from '@domain/availability/to-taken-nights';
import type { AvailabilityResult } from '@domain/availability/types';
import { dateKeyFromParts, dateKeyParts, toDateKey, type DateKey } from '@domain/dates/date-key';
import { shiftMonth } from '@domain/dates/month';
import type { AvailabilityCache } from './availability-cache';
import { CalendarNotConfiguredError } from './calendar-source';
import type { CalendarLoader } from './create-calendar-loader';
import type { AvailabilityOutcome } from './log';

/** What the service needs from outside; passed in so it can be tested without a network or a clock. */
export interface AvailabilityServiceDeps {
  loadCalendar: CalendarLoader;
  cache: AvailabilityCache;
  now: () => Date;
  log: (cabinId: string, outcome: AvailabilityOutcome) => void;
  config: { cacheMs: number; staleAfterMs: number; monthsAhead: number };
}

/** Returns the window a reading covers: from today to the first day after the last month shown. */
export function readingWindow(today: DateKey, monthsAhead: number): { from: DateKey; to: DateKey } {
  const { year, month } = dateKeyParts(today);
  const end = shiftMonth({ year, month }, monthsAhead);
  return { from: today, to: dateKeyFromParts(end.year, end.month, 1) };
}

/** Creates the service that answers "which nights of this cabin are taken". */
export function createAvailabilityService(deps: AvailabilityServiceDeps) {
  /** Reads the calendar now and stores the result. */
  async function readFresh(cabinId: string, now: Date): Promise<AvailabilityResult> {
    const { from, to } = readingWindow(toDateKey(now), deps.config.monthsAhead);
    const nights = toTakenNights(parseIcal(await deps.loadCalendar(cabinId)), from, to);
    const result = knownResult(nights, from, to, now);
    deps.cache.set(cabinId, { result, storedAt: now.getTime() });
    return result;
  }

  /** Answers for one cabin: from the cache if recent, else from the calendar; never "free" on failure (H7). */
  return async function getAvailability(cabinId: string): Promise<AvailabilityResult> {
    const now = deps.now();
    const cached = deps.cache.get(cabinId);
    if (cached && now.getTime() - cached.storedAt < deps.config.cacheMs) {
      deps.log(cabinId, 'cache');
      return cached.result;
    }
    try {
      const result = await readFresh(cabinId, now);
      deps.log(cabinId, 'fetched');
      return result;
    } catch (error) {
      if (error instanceof CalendarNotConfiguredError) {
        deps.log(cabinId, 'not_configured');
        return unknownResult('not_configured');
      }
      deps.log(cabinId, 'fetch_failed');
      return cached
        ? withFreshness(cached.result, now, deps.config.staleAfterMs)
        : unknownResult('calendar_unavailable');
    }
  };
}
