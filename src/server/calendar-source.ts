/** Raised when a cabin has no usable calendar address. */
export class CalendarNotConfiguredError extends Error {
  constructor() {
    super('calendar_not_configured');
  }
}

/** Reads the secret map of calendar addresses ({"cabin-id": "https://..."}); anything malformed gives an empty map. */
export function parseCalendarUrlMap(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

/**
 * Finds a cabin's calendar address. The request only ever names a cabin id; the address comes from the
 * server's secret and must be HTTPS on an allowed host, so the server cannot be sent anywhere else (S11).
 */
export function resolveCalendarUrl(
  cabinId: string,
  urlMap: Record<string, string>,
  allowedHosts: readonly string[],
): URL {
  const raw = Object.hasOwn(urlMap, cabinId) ? urlMap[cabinId] : undefined;
  if (!raw || !URL.canParse(raw)) throw new CalendarNotConfiguredError();
  const url = new URL(raw);
  if (url.protocol !== 'https:' || !allowedHosts.includes(url.hostname)) throw new CalendarNotConfiguredError();
  return url;
}
