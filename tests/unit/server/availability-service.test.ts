import { describe, expect, it, vi } from 'vitest';
import { createAvailabilityCache } from '@server/availability-cache';
import { createAvailabilityService, readingWindow } from '@server/availability-service';
import { CalendarNotConfiguredError } from '@server/calendar-source';
import { errorResponse, jsonResponse } from '@server/http-response';
import { buildSampleCalendar } from '@server/sample-calendar';

const MINUTE = 60 * 1000;
const config = { cacheMs: 5 * MINUTE, staleAfterMs: 60 * MINUTE, monthsAhead: 2 };
const feed = [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261105',
  'DTEND;VALUE=DATE:20261107',
  'SUMMARY:Dana Cohen 052-9876543',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

/** Builds a service over a fake clock and a fake calendar loader. */
function setup(loadCalendar: (cabinId: string) => Promise<string>) {
  let now = new Date('2026-11-01T10:00:00Z');
  const log = vi.fn();
  const getAvailability = createAvailabilityService({
    loadCalendar: vi.fn(loadCalendar),
    cache: createAvailabilityCache(),
    now: () => now,
    log,
    config,
  });
  const advance = (ms: number) => (now = new Date(now.getTime() + ms));
  return { getAvailability, advance, log };
}

describe('readingWindow', () => {
  it('runs from today to the first day after the last month', () => {
    expect(readingWindow('2026-11-15', 2)).toEqual({ from: '2026-11-15', to: '2027-01-01' });
  });
});

describe('availability service', () => {
  it('returns only dates, never the event text (L8)', async () => {
    const { getAvailability } = setup(async () => feed);
    const result = await getAvailability('gefen');
    expect(result).toEqual({
      status: 'known',
      takenNights: ['2026-11-05', '2026-11-06'],
      from: '2026-11-01',
      to: '2027-01-01',
      updatedAt: '2026-11-01T10:00:00.000Z',
    });
    expect(JSON.stringify(result)).not.toMatch(/Dana|052/);
  });

  it('answers from the cache inside the cache time (S3)', async () => {
    const load = vi.fn(async () => feed);
    const { getAvailability, advance } = setup(load);
    await getAvailability('gefen');
    advance(4 * MINUTE);
    await getAvailability('gefen');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('says unknown when the calendar fails and nothing was read before (H7)', async () => {
    const { getAvailability, log } = setup(async () => {
      throw new Error('down');
    });
    expect(await getAvailability('gefen')).toEqual({ status: 'unknown', reason: 'calendar_unavailable' });
    expect(log).toHaveBeenCalledWith('gefen', 'fetch_failed');
  });

  it('keeps the last reading through a short failure, then says stale (H7)', async () => {
    let fail = false;
    const { getAvailability, advance } = setup(async () => {
      if (fail) throw new Error('down');
      return feed;
    });
    await getAvailability('gefen');
    fail = true;
    advance(10 * MINUTE);
    expect((await getAvailability('gefen')).status).toBe('known');
    advance(60 * MINUTE);
    expect(await getAvailability('gefen')).toEqual({ status: 'unknown', reason: 'stale' });
  });

  it('says not configured for a cabin without a calendar', async () => {
    const { getAvailability } = setup(async () => {
      throw new CalendarNotConfiguredError();
    });
    expect(await getAvailability('gefen')).toEqual({ status: 'unknown', reason: 'not_configured' });
  });

  it('says unknown when the feed is not a calendar', async () => {
    const { getAvailability } = setup(async () => '<html>sign in</html>');
    expect((await getAvailability('gefen')).status).toBe('unknown');
  });
});

describe('sample calendar', () => {
  it('is a readable calendar with bookings ahead of today', async () => {
    const { getAvailability } = setup(async (cabinId) => buildSampleCalendar(cabinId, '2026-11-01'));
    const result = await getAvailability('gefen');
    expect(result.status === 'known' && result.takenNights.length).toBeGreaterThan(5);
  });
});

describe('http responses', () => {
  it('sends JSON with no CORS header and an error as a code only (S4, S12)', async () => {
    const ok = jsonResponse({ a: 1 }, 200, 60);
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(ok.headers.get('Cache-Control')).toBe('public, max-age=60');
    const error = errorResponse('unknown_cabin', 404);
    expect(error.status).toBe(404);
    expect(await error.json()).toEqual({ error: 'unknown_cabin' });
    expect(error.headers.get('Cache-Control')).toBe('no-store');
  });
});
