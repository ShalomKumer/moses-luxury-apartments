import { addDays, type DateKey } from '@domain/dates/date-key';

/** Turns a cabin id into a small number, so each sample cabin gets different bookings. */
function seedOf(cabinId: string): number {
  return [...cabinId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 7;
}

/** Writes a date key as an iCal all-day value. */
function icalDay(key: DateKey): string {
  return key.replaceAll('-', '');
}

/**
 * Builds a made-up calendar for local development, so the page can be seen working without the owner's
 * calendars. It is used only when the dev server runs with AVAILABILITY_SOURCE=sample, never in production.
 */
export function buildSampleCalendar(cabinId: string, today: DateKey): string {
  const seed = seedOf(cabinId);
  const stays = [
    [1 + seed, 2],
    [6 + seed, 3],
    [15 + seed, 2],
    [24 + seed, 4],
    [40 + seed, 2],
  ];
  const events = stays.flatMap(([offset, nights]) => [
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${icalDay(addDays(today, offset))}`,
    `DTEND;VALUE=DATE:${icalDay(addDays(today, offset + nights))}`,
    'SUMMARY:Sample booking',
    'END:VEVENT',
  ]);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events, 'END:VCALENDAR'].join('\r\n');
}
