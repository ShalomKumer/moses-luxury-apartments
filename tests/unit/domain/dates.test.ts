import { describe, expect, it } from 'vitest';
import { addDays, isDateKey, toDateKey, weekday } from '@domain/dates/date-key';
import { countNights, nightsBetween } from '@domain/dates/date-range';
import { formatDateKey, formatDayLabel, formatMonthTitle } from '@domain/dates/format-date';
import { shiftMonth } from '@domain/dates/month';

describe('date keys', () => {
  it('reads an instant as the day in Israel, not in UTC', () => {
    expect(toDateKey(new Date('2026-11-04T22:30:00Z'))).toBe('2026-11-05');
  });

  it('accepts only real days', () => {
    expect(isDateKey('2026-02-28')).toBe(true);
    expect(isDateKey('2026-02-29')).toBe(false);
    expect(isDateKey('2026-2-1')).toBe(false);
    expect(isDateKey(20261101)).toBe(false);
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('knows the weekday', () => {
    expect(weekday('2026-11-01')).toBe(0);
  });
});

describe('date ranges', () => {
  it('lists the nights of a stay without the check-out day', () => {
    expect(nightsBetween('2026-11-05', '2026-11-07')).toEqual(['2026-11-05', '2026-11-06']);
    expect(countNights('2026-11-05', '2026-11-05')).toBe(0);
  });
});

describe('months', () => {
  it('moves between months and years', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth({ year: 2026, month: 11 }, 12)).toEqual({ year: 2027, month: 11 });
  });
});

describe('formatting', () => {
  it('writes dates the Israeli way', () => {
    expect(formatDateKey('2026-11-05')).toBe('05.11.2026');
    expect(formatMonthTitle(2026, 11)).toBe('נובמבר 2026');
    expect(formatDayLabel('2026-11-05', 4)).toBe('יום חמישי, 5 בנובמבר 2026');
  });
});
