import { describe, expect, it } from 'vitest';
import {
  clampViewMonth,
  daysInMonth,
  isSelectable,
  lastSelectableDay,
  monthIsReachable,
  monthOf,
  monthWeeks,
  viewMonthFor,
} from '@domain/dates/calendar-month';
import { isNavigationKey, navigate } from '@domain/dates/day-navigation';
import { FLEX_OPTIONS, parseFlex } from '@domain/dates/flex-days';
import { EMPTY_RANGE, isBetween, pickDay, rangeNights } from '@domain/dates/range-selection';

describe('calendar months', () => {
  it('knows the length of every month, leap years included', () => {
    expect(daysInMonth(2027, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2026, 11)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('lays a month out in weeks of seven, Sunday first, padded with nulls', () => {
    // November 2026 starts on a Sunday and ends on a Monday
    const weeks = monthWeeks({ year: 2026, month: 11 });
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0][0]).toBe('2026-11-01');
    expect(weeks).toHaveLength(5);
    expect(weeks[4]).toEqual(['2026-11-29', '2026-11-30', null, null, null, null, null]);
  });

  it('pads the start of a month that begins late in the week', () => {
    // January 2027 starts on a Friday
    const weeks = monthWeeks({ year: 2027, month: 1 });
    expect(weeks[0]).toEqual([null, null, null, null, null, '2027-01-01', '2027-01-02']);
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
  });

  it('keeps every day exactly once, in order, across a leap February', () => {
    const days = monthWeeks({ year: 2028, month: 2 })
      .flat()
      .filter((day): day is string => day !== null);
    expect(days).toHaveLength(29);
    expect(days).toEqual([...days].sort());
    expect(days.at(-1)).toBe('2028-02-29');
  });

  it('gives a month that fits exactly four weeks no empty row', () => {
    // February 2026 starts on a Sunday and has 28 days
    expect(monthWeeks({ year: 2026, month: 2 })).toHaveLength(4);
  });

  it('says which month a day is in', () => {
    expect(monthOf('2026-12-31')).toEqual({ year: 2026, month: 12 });
  });
});

describe('what can be chosen', () => {
  const today = '2026-11-10';

  it('lets a guest choose today and the days after it, up to a year ahead', () => {
    expect(isSelectable('2026-11-10', today)).toBe(true);
    expect(isSelectable('2026-11-09', today)).toBe(false);
    expect(lastSelectableDay(today)).toBe('2027-11-10');
    expect(isSelectable('2027-11-10', today)).toBe(true);
    expect(isSelectable('2027-11-11', today)).toBe(false);
  });

  it('cuts the last day to the length of the month a year ahead', () => {
    expect(lastSelectableDay('2027-02-28')).toBe('2028-02-28');
    expect(lastSelectableDay('2028-02-29')).toBe('2029-02-28');
    expect(lastSelectableDay('2026-12-31')).toBe('2027-12-31');
  });

  it('knows which months hold a day that can be chosen', () => {
    expect(monthIsReachable({ year: 2026, month: 10 }, today)).toBe(false);
    expect(monthIsReachable({ year: 2026, month: 11 }, today)).toBe(true);
    expect(monthIsReachable({ year: 2027, month: 11 }, today)).toBe(true);
    expect(monthIsReachable({ year: 2027, month: 12 }, today)).toBe(false);
  });
});

describe('picking days', () => {
  it('makes the first click the check-in', () => {
    expect(pickDay(EMPTY_RANGE, '2026-11-12')).toEqual({ start: '2026-11-12', end: null });
  });

  it('makes a later second click the check-out', () => {
    const range = pickDay({ start: '2026-11-12', end: null }, '2026-11-15');
    expect(range).toEqual({ start: '2026-11-12', end: '2026-11-15' });
    expect(rangeNights(range)).toBe(3);
  });

  it('starts over when the second click is on or before the check-in, so there is never an error', () => {
    expect(pickDay({ start: '2026-11-12', end: null }, '2026-11-12')).toEqual({ start: '2026-11-12', end: null });
    expect(pickDay({ start: '2026-11-12', end: null }, '2026-11-10')).toEqual({ start: '2026-11-10', end: null });
  });

  it('starts a new stay on a click after a finished range', () => {
    expect(pickDay({ start: '2026-11-12', end: '2026-11-15' }, '2026-11-20')).toEqual({
      start: '2026-11-20',
      end: null,
    });
    expect(pickDay({ start: '2026-11-12', end: '2026-11-15' }, '2026-11-13')).toEqual({
      start: '2026-11-13',
      end: null,
    });
  });

  it('counts a stay across the end of a year', () => {
    expect(rangeNights({ start: '2026-12-30', end: '2027-01-02' })).toBe(3);
    expect(rangeNights({ start: '2026-12-30', end: null })).toBeNull();
    expect(rangeNights(EMPTY_RANGE)).toBeNull();
  });

  it('shades only the days between the two ends', () => {
    const range = { start: '2026-11-12', end: '2026-11-15' };
    expect(isBetween(range, '2026-11-13')).toBe(true);
    expect(isBetween(range, '2026-11-14')).toBe(true);
    expect(isBetween(range, '2026-11-12')).toBe(false);
    expect(isBetween(range, '2026-11-15')).toBe(false);
    expect(isBetween({ start: '2026-11-12', end: null }, '2026-11-13')).toBe(false);
  });
});

describe('moving between days by keyboard', () => {
  const today = '2026-11-10';

  it('follows what is drawn: in a right-to-left page the left arrow is the next day', () => {
    expect(navigate('2026-11-15', 'ArrowLeft', true, today)).toBe('2026-11-16');
    expect(navigate('2026-11-15', 'ArrowRight', true, today)).toBe('2026-11-14');
    expect(navigate('2026-11-15', 'ArrowRight', false, today)).toBe('2026-11-16');
    expect(navigate('2026-11-15', 'ArrowLeft', false, today)).toBe('2026-11-14');
  });

  it('moves a week with up and down', () => {
    expect(navigate('2026-11-15', 'ArrowDown', true, today)).toBe('2026-11-22');
    expect(navigate('2026-11-22', 'ArrowUp', true, today)).toBe('2026-11-15');
  });

  it('goes to the start and the end of the week', () => {
    // 2026-11-12 is a Thursday
    expect(navigate('2026-11-12', 'Home', false, today)).toBe('2026-11-10');
    expect(navigate('2026-11-12', 'End', false, today)).toBe('2026-11-14');
  });

  it('moves a month, cutting the day to the new month', () => {
    expect(navigate('2026-12-31', 'PageDown', false, today)).toBe('2027-01-31');
    expect(navigate('2027-01-31', 'PageDown', false, today)).toBe('2027-02-28');
    expect(navigate('2027-03-31', 'PageUp', false, today)).toBe('2027-02-28');
  });

  it('stays between today and the last day that can be chosen', () => {
    expect(navigate('2026-11-10', 'ArrowLeft', false, today)).toBe('2026-11-10');
    expect(navigate('2026-11-12', 'Home', false, today)).toBe('2026-11-10');
    expect(navigate('2026-11-12', 'PageUp', false, today)).toBe('2026-11-10');
    expect(navigate('2027-11-10', 'ArrowDown', false, today)).toBe('2027-11-10');
    expect(navigate('2027-11-08', 'PageDown', false, today)).toBe('2027-11-10');
  });

  it('recognises only the movement keys', () => {
    expect(isNavigationKey('PageUp')).toBe(true);
    expect(isNavigationKey('Enter')).toBe(false);
    expect(isNavigationKey('')).toBe(false);
  });
});

describe('flexible dates', () => {
  it('offers the options of the screenshot: exact, 1, 2, 3 and 7 days', () => {
    expect([...FLEX_OPTIONS]).toEqual([0, 1, 2, 3, 7]);
  });

  it('reads an option back from the page, and anything else as exact dates', () => {
    expect(parseFlex('2')).toBe(2);
    expect(parseFlex('7')).toBe(7);
    expect(parseFlex('0')).toBe(0);
    expect(parseFlex('')).toBe(0);
    expect(parseFlex('4')).toBe(0);
    expect(parseFlex('-1')).toBe(0);
    expect(parseFlex('abc')).toBe(0);
    expect(parseFlex('2 ')).toBe(2);
  });
});

describe('which months the calendar shows', () => {
  const today = '2026-11-10';

  it('never starts before the current month', () => {
    expect(clampViewMonth({ year: 2026, month: 9 }, today, 1)).toEqual({ year: 2026, month: 11 });
    expect(clampViewMonth({ year: 2026, month: 11 }, today, 2)).toEqual({ year: 2026, month: 11 });
  });

  it('never starts so late that the months shown run past the last month a day can be chosen', () => {
    // the last choosable day is 2027-11-10
    expect(clampViewMonth({ year: 2027, month: 11 }, today, 1)).toEqual({ year: 2027, month: 11 });
    expect(clampViewMonth({ year: 2027, month: 11 }, today, 2)).toEqual({ year: 2027, month: 10 });
    expect(clampViewMonth({ year: 2028, month: 5 }, today, 2)).toEqual({ year: 2027, month: 10 });
  });

  it('leaves a view that is already fine alone', () => {
    expect(clampViewMonth({ year: 2027, month: 3 }, today, 2)).toEqual({ year: 2027, month: 3 });
  });

  it('keeps the view when the day is on screen, and moves it to the nearest view that has the day otherwise', () => {
    const view = { year: 2026, month: 12 };
    expect(viewMonthFor('2026-12-20', view, today, 1)).toEqual(view);
    expect(viewMonthFor('2027-01-05', view, today, 2)).toEqual(view);
    expect(viewMonthFor('2027-01-05', view, today, 1)).toEqual({ year: 2027, month: 1 });
    expect(viewMonthFor('2027-03-05', view, today, 2)).toEqual({ year: 2027, month: 2 });
    expect(viewMonthFor('2026-11-20', view, today, 2)).toEqual({ year: 2026, month: 11 });
  });
});
