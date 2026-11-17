import { describe, expect, it } from 'vitest';
import { parseIcal } from '@domain/availability/parse-ical';
import { toTakenNights } from '@domain/availability/to-taken-nights';

/** Wraps events in a minimal calendar, with CRLF endings as Google sends them. */
const calendar = (...events: string[]) => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events, 'END:VCALENDAR'].join('\r\n');

const allDayBooking = [
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261105',
  'DTEND;VALUE=DATE:20261107',
  'SUMMARY:ישראל ישראלי 050-1234567',
  'DESCRIPTION:guest@example.com\\, 2 adults',
  'ATTENDEE;CN=Israel Israeli:mailto:guest@example.com',
  'END:VEVENT',
].join('\r\n');

describe('parseIcal', () => {
  it('reads an all-day booking as its nights', () => {
    expect(parseIcal(calendar(allDayBooking))).toEqual([{ start: '2026-11-05', end: '2026-11-07' }]);
  });

  it('keeps nothing but dates: no name, phone or email reaches the result (L8)', () => {
    const output = JSON.stringify(parseIcal(calendar(allDayBooking)));
    for (const secret of ['ישראל', '050', 'guest@example.com', 'Israeli', 'adults']) {
      expect(output).not.toContain(secret);
    }
  });

  it('reads a UTC time as the day in Israel', () => {
    const event = ['BEGIN:VEVENT', 'DTSTART:20261104T230000Z', 'DTEND:20261106T080000Z', 'END:VEVENT'].join('\r\n');
    expect(parseIcal(calendar(event))).toEqual([{ start: '2026-11-05', end: '2026-11-06' }]);
  });

  it('reads a local time with a TZID by its date', () => {
    const event = [
      'BEGIN:VEVENT',
      'DTSTART;TZID=Asia/Jerusalem:20261105T150000',
      'DTEND;TZID=Asia/Jerusalem:20261107T110000',
      'END:VEVENT',
    ].join('\r\n');
    expect(parseIcal(calendar(event))).toEqual([{ start: '2026-11-05', end: '2026-11-07' }]);
  });

  it('blocks at least the start night of a same-day event', () => {
    const event = ['BEGIN:VEVENT', 'DTSTART:20261105T080000Z', 'DTEND:20261105T140000Z', 'END:VEVENT'].join('\r\n');
    expect(parseIcal(calendar(event))).toEqual([{ start: '2026-11-05', end: '2026-11-06' }]);
  });

  it('ignores a cancelled event', () => {
    const event = allDayBooking.replace('END:VEVENT', 'STATUS:CANCELLED\r\nEND:VEVENT');
    expect(parseIcal(calendar(event))).toEqual([]);
  });

  it('joins folded lines', () => {
    const folded = allDayBooking.replace('DTSTART;VALUE=DATE:20261105', 'DTSTART;VALUE=DA\r\n TE:20261105');
    expect(parseIcal(calendar(folded))).toEqual([{ start: '2026-11-05', end: '2026-11-07' }]);
  });

  it('refuses text that is not a calendar', () => {
    expect(() => parseIcal('<html>login</html>')).toThrow('not_a_calendar');
  });
});

describe('toTakenNights', () => {
  it('merges spans, sorts, and clips to the window', () => {
    const spans = [
      { start: '2026-11-05', end: '2026-11-07' },
      { start: '2026-11-06', end: '2026-11-08' },
      { start: '2026-10-30', end: '2026-11-02' },
    ];
    expect(toTakenNights(spans, '2026-11-01', '2026-11-07')).toEqual(['2026-11-01', '2026-11-05', '2026-11-06']);
  });
});
