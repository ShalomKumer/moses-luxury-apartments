import type { AvailabilityResult } from '@domain/availability/types';

/** A stored reading and when it was stored (milliseconds since the epoch). */
export interface CacheEntry {
  result: AvailabilityResult;
  storedAt: number;
}

/** The last good reading per cabin. */
export interface AvailabilityCache {
  get(cabinId: string): CacheEntry | undefined;
  set(cabinId: string, entry: CacheEntry): void;
}

/** Creates an in-memory cache; it lives as long as the server instance and holds only dates. */
export function createAvailabilityCache(): AvailabilityCache {
  const entries = new Map<string, CacheEntry>();
  return {
    get: (cabinId) => entries.get(cabinId),
    set: (cabinId, entry) => void entries.set(cabinId, entry),
  };
}
