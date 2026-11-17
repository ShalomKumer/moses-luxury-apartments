import { describe, expect, it, vi } from 'vitest';
import { CalendarNotConfiguredError, parseCalendarUrlMap, resolveCalendarUrl } from '@server/calendar-source';
import { CalendarFetchError, fetchCalendarText } from '@server/fetch-calendar';

const allowed = ['calendar.google.com'];
const goodUrl = 'https://calendar.google.com/calendar/ical/abc/private-xyz/basic.ics'; // secret-scan:allow a made-up address for the test

describe('parseCalendarUrlMap', () => {
  it('reads a JSON object of strings and drops the rest', () => {
    expect(parseCalendarUrlMap(JSON.stringify({ gefen: goodUrl, bad: 5 }))).toEqual({ gefen: goodUrl });
    expect(parseCalendarUrlMap('not json')).toEqual({});
    expect(parseCalendarUrlMap('[1]')).toEqual({});
    expect(parseCalendarUrlMap(undefined)).toEqual({});
  });
});

describe('resolveCalendarUrl (S11)', () => {
  it('returns the configured address of a known cabin', () => {
    expect(resolveCalendarUrl('gefen', { gefen: goodUrl }, allowed).href).toBe(goodUrl);
  });

  it('refuses a missing cabin, an inherited key, a foreign host and plain HTTP', () => {
    const cases: [string, Record<string, string>][] = [
      ['other', { gefen: goodUrl }],
      ['__proto__', {}],
      ['gefen', { gefen: 'https://169.254.169.254/latest/meta-data' }],
      ['gefen', { gefen: 'https://calendar.google.com.evil.example/x.ics' }],
      ['gefen', { gefen: 'http://calendar.google.com/x.ics' }],
      ['gefen', { gefen: 'not a url' }],
    ];
    for (const [cabinId, map] of cases) {
      expect(() => resolveCalendarUrl(cabinId, map, allowed)).toThrow(CalendarNotConfiguredError);
    }
  });
});

describe('fetchCalendarText', () => {
  const options = { timeoutMs: 1000, maxBytes: 100 };

  it('returns the body and refuses redirects', async () => {
    const fetchImpl = vi.fn(async () => new Response('BEGIN:VCALENDAR'));
    await expect(fetchCalendarText(new URL(goodUrl), options, fetchImpl)).resolves.toBe('BEGIN:VCALENDAR');
    expect(fetchImpl).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ redirect: 'error' }));
  });

  it('fails without the address in the error, on status, size and network errors', async () => {
    const failures = [
      async () => new Response('', { status: 404 }),
      async () => new Response('x'.repeat(101)),
      async () => {
        throw new TypeError('network');
      },
    ];
    for (const fetchImpl of failures) {
      const error = await fetchCalendarText(new URL(goodUrl), options, fetchImpl).catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(CalendarFetchError);
      expect(String(error)).not.toContain('calendar.google.com');
    }
  });
});
