import { describe, expect, it } from 'vitest';
import { buildBookingMessage, type BookingTexts } from '../../../src/domain/booking/booking-message';
import { resolveStay, toChosenDates } from '../../../src/domain/booking/stay-dates';

const TODAY = '2026-11-02';

const texts: BookingTexts = {
  intro: 'Hello, {cabin}.',
  introAny: 'Hello.',
  datesPlaceholder: 'My dates: ',
  dates: 'Dates: {from} to {to} ({nights})',
  checkIn: 'Check-in: {from}',
  oneNight: 'one night',
  nights: '{count} nights',
  guests: 'Guests: {count}',
  guestsDetail: 'Guests: {count} ({detail})',
  couplesOne: '1 couple',
  couplesMany: '{count} couples',
  childOne: '1 child',
  childMany: '{count} children',
  name: 'Name: {name}',
  namePlaceholder: 'Name: ',
  flexOne: 'Flexible: 1 day',
  flexMany: 'Flexible: {count} days',
  subject: 'Booking request - {cabin}',
};

describe('resolveStay', () => {
  it('accepts a check-in and a later check-out', () => {
    expect(resolveStay('2026-11-05', '2026-11-08', TODAY)).toEqual({
      checkIn: '2026-11-05',
      checkOut: '2026-11-08',
      nights: 3,
      problem: null,
    });
  });

  it('counts one night', () => {
    expect(resolveStay('2026-11-05', '2026-11-06', TODAY).nights).toBe(1);
  });

  it('accepts a check-in today', () => {
    expect(resolveStay(TODAY, '2026-11-03', TODAY).problem).toBeNull();
  });

  it('counts nights across a month, a year and a leap day', () => {
    expect(resolveStay('2026-12-30', '2027-01-02', TODAY).nights).toBe(3);
    expect(resolveStay('2028-02-28', '2028-03-01', '2028-01-01').nights).toBe(2);
  });

  it('says nothing while both fields are empty', () => {
    expect(resolveStay('', '', TODAY)).toEqual({ checkIn: null, checkOut: null, nights: null, problem: null });
  });

  it('keeps a check-in on its own', () => {
    expect(resolveStay('2026-11-05', '', TODAY)).toEqual({
      checkIn: '2026-11-05',
      checkOut: null,
      nights: null,
      problem: null,
    });
  });

  it('ignores a check-out on its own, without a note', () => {
    expect(resolveStay('', '2026-11-08', TODAY)).toEqual({
      checkIn: null,
      checkOut: null,
      nights: null,
      problem: null,
    });
  });

  it('leaves out a check-in in the past, and the check-out with it', () => {
    expect(resolveStay('2026-11-01', '2026-11-08', TODAY)).toEqual({
      checkIn: null,
      checkOut: null,
      nights: null,
      problem: 'check-in-past',
    });
  });

  it('leaves out a check-out on the check-in day or before it, and keeps the check-in', () => {
    for (const checkOut of ['2026-11-05', '2026-11-04']) {
      expect(resolveStay('2026-11-05', checkOut, TODAY)).toEqual({
        checkIn: '2026-11-05',
        checkOut: null,
        nights: null,
        problem: 'check-out-not-after',
      });
    }
  });

  it('treats a malformed or impossible date as not typed yet', () => {
    for (const value of ['abc', '2026-13-01', '2026-02-30', '05.11.2026', '0000-00-00']) {
      expect(resolveStay(value, '2026-11-08', TODAY)).toEqual({
        checkIn: null,
        checkOut: null,
        nights: null,
        problem: null,
      });
    }
  });
});

describe('the message with chosen dates', () => {
  it('writes both dates and the nights, without an apartment', () => {
    const stay = resolveStay('2026-11-05', '2026-11-08', TODAY);
    expect(buildBookingMessage(texts, null, 2, toChosenDates(stay))).toBe(
      'Hello.\nDates: 05.11.2026 to 08.11.2026 (3 nights)\nGuests: 2',
    );
  });

  it('writes one night in words', () => {
    const stay = resolveStay('2026-11-05', '2026-11-06', TODAY);
    expect(buildBookingMessage(texts, null, null, toChosenDates(stay))).toContain('(one night)');
  });

  it('writes only the check-in when the check-out is not valid', () => {
    const stay = resolveStay('2026-11-05', '2026-11-04', TODAY);
    expect(buildBookingMessage(texts, null, null, toChosenDates(stay))).toBe('Hello.\nCheck-in: 05.11.2026');
  });

  it('writes the placeholder when no date is valid', () => {
    const stay = resolveStay('2026-11-01', '2026-11-08', TODAY);
    expect(buildBookingMessage(texts, null, null, toChosenDates(stay))).toBe('Hello.\nMy dates: ');
  });

  it('names the apartment when one is chosen', () => {
    expect(buildBookingMessage(texts, 'Gefen', null, toChosenDates(resolveStay('', '', TODAY)))).toBe(
      'Hello, Gefen.\nMy dates: ',
    );
  });
});
