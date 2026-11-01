import { isDateKey, type DateKey } from '../dates/date-key';
import { isFresh } from './freshness';
import type { AvailabilityResult, UnknownReason } from './types';

const UNKNOWN_REASONS: UnknownReason[] = ['calendar_unavailable', 'stale', 'not_configured'];

/** Builds a known result. */
export function knownResult(takenNights: DateKey[], from: DateKey, to: DateKey, updatedAt: Date): AvailabilityResult {
  return { status: 'known', takenNights, from, to, updatedAt: updatedAt.toISOString() };
}

/** Builds an unknown result with its reason. */
export function unknownResult(reason: UnknownReason): AvailabilityResult {
  return { status: 'unknown', reason };
}

/** Turns a known result that is too old into "unknown, stale"; anything else is returned as is (H7). */
export function withFreshness(result: AvailabilityResult, now: Date, maxAgeMs: number): AvailabilityResult {
  if (result.status === 'known' && !isFresh(result.updatedAt, now, maxAgeMs)) return unknownResult('stale');
  return result;
}

/** Checks untrusted JSON (from the network) and returns it as a result; anything malformed is "unknown". */
export function parseAvailabilityResult(value: unknown): AvailabilityResult {
  if (typeof value !== 'object' || value === null) return unknownResult('calendar_unavailable');
  const data = value as Record<string, unknown>;
  if (data.status === 'unknown' && UNKNOWN_REASONS.includes(data.reason as UnknownReason)) {
    return unknownResult(data.reason as UnknownReason);
  }
  const validKnown =
    data.status === 'known' &&
    Array.isArray(data.takenNights) &&
    data.takenNights.every(isDateKey) &&
    isDateKey(data.from) &&
    isDateKey(data.to) &&
    typeof data.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(data.updatedAt));
  if (!validKnown) return unknownResult('calendar_unavailable');
  return {
    status: 'known',
    takenNights: data.takenNights as DateKey[],
    from: data.from as DateKey,
    to: data.to as DateKey,
    updatedAt: data.updatedAt as string,
  };
}
