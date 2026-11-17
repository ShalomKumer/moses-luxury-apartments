/** Limits of the availability service and of the calendar on the page. */
export const AVAILABILITY_CONFIG = {
  /** How long the server reuses a calendar reading before asking Google again (S3). */
  cacheMs: 5 * 60 * 1000,
  /** After this age a reading is no longer shown; the page says "unknown" instead (H7). */
  staleAfterMs: 60 * 60 * 1000,
  /** How many months ahead the reading covers, counting the current one. */
  monthsAhead: 12,
  /** How long the server waits for a calendar. */
  fetchTimeoutMs: 8000,
  /** The largest calendar feed the server accepts. */
  maxCalendarBytes: 2_000_000,
  /** The only hosts a calendar address may point to (S11). */
  allowedCalendarHosts: ['calendar.google.com'],
  /** How long a browser may reuse an answer of the API. */
  responseCacheSeconds: 60,
} as const;
