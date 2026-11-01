/** Raised when a calendar could not be fetched; it never carries the address (S13, S15). */
export class CalendarFetchError extends Error {
  constructor(reason: string) {
    super(`calendar_fetch_failed:${reason}`);
  }
}

/** Limits of one fetch. */
export interface FetchCalendarOptions {
  timeoutMs: number;
  maxBytes: number;
}

/** Downloads a calendar feed as text, with a timeout, a size limit and no redirects (S11). */
export async function fetchCalendarText(
  url: URL,
  { timeoutMs, maxBytes }: FetchCalendarOptions,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  let response: Response;
  try {
    response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    throw new CalendarFetchError('network');
  }
  if (!response.ok) throw new CalendarFetchError(`status_${response.status}`);
  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > maxBytes) throw new CalendarFetchError('too_large');
  const text = await response.text();
  if (text.length > maxBytes) throw new CalendarFetchError('too_large');
  return text;
}
