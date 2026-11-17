import type { DateKey } from '../dates/date-key';
import { nightsBetween } from '../dates/date-range';
import type { AvailabilityResult, NightStatus } from './types';

/** Says whether one night is free, taken, or unknown (outside the reading, or no reading at all). */
export function nightStatus(result: AvailabilityResult, night: DateKey): NightStatus {
  if (result.status !== 'known') return 'unknown';
  if (night < result.from || night >= result.to) return 'unknown';
  return result.takenNights.includes(night) ? 'taken' : 'free';
}

/** Says whether a whole stay is free: taken if any night is taken, unknown if any night is unknown. */
export function stayStatus(result: AvailabilityResult, checkIn: DateKey, checkOut: DateKey): NightStatus {
  const statuses = nightsBetween(checkIn, checkOut).map((night) => nightStatus(result, night));
  if (statuses.length === 0) return 'unknown';
  if (statuses.includes('taken')) return 'taken';
  if (statuses.includes('unknown')) return 'unknown';
  return 'free';
}
