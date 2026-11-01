/** What happened to one availability request. */
export type AvailabilityOutcome = 'cache' | 'fetched' | 'not_configured' | 'fetch_failed' | 'unknown_cabin';

/** Writes one log line: the cabin id (shortened) and the outcome, never an address or calendar text (S15). */
export function logAvailability(cabinId: string, outcome: AvailabilityOutcome): void {
  console.info(JSON.stringify({ event: 'availability', cabinId: cabinId.slice(0, 40), outcome }));
}
