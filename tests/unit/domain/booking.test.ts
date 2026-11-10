import { describe, expect, it } from 'vitest';
import { buildBookingMessage, buildBookingSubject } from '@domain/booking/booking-message';
import { gmailComposeLink } from '@domain/booking/gmail-link';
import { mailtoLink } from '@domain/booking/mailto-link';
import { toInternationalDigits } from '@domain/booking/phone-number';
import { telLink } from '@domain/booking/tel-link';
import { whatsappLink } from '@domain/booking/whatsapp-link';
import { fillTemplate } from '@domain/text/fill-template';
import { splitParagraphs } from '@domain/text/paragraphs';
import { en } from '@i18n/messages/en';
import { he } from '@i18n/messages/he';

describe('booking message in Hebrew', () => {
  const texts = he.booking.message;

  it('asks to check availability, leaves the dates to the guest, and adds the guest count', () => {
    expect(buildBookingMessage(texts, 'דירת הגפן', 2)).toBe(
      'שלום, אשמח לבדוק זמינות והזמנה בדירת הגפן.\nהתאריכים שמתאימים לי: \nמספר אורחים: 2',
    );
  });

  it('leaves out the guest count when none is chosen, and never names a date', () => {
    const message = buildBookingMessage(texts, 'דירת הגפן', null);
    expect(message).toBe('שלום, אשמח לבדוק זמינות והזמנה בדירת הגפן.\nהתאריכים שמתאימים לי: ');
    expect(message).not.toMatch(/\d{2}\.\d{2}\.\d{4}/);
    expect(buildBookingSubject(texts, 'דירת הגפן')).toBe('בקשת הזמנה - דירת הגפן');
  });

  it('writes chosen dates and the number of nights', () => {
    expect(buildBookingMessage(texts, null, 2, { from: '10.11.2026', to: '13.11.2026', nights: 3 })).toBe(
      'שלום, אשמח לבדוק זמינות והזמנה.\nתאריכים: 10.11.2026 עד 13.11.2026 (3 לילות)\nמספר אורחים: 2',
    );
    expect(buildBookingMessage(texts, null, null, { from: '10.11.2026', to: '11.11.2026', nights: 1 })).toContain(
      '(לילה אחד)',
    );
    expect(buildBookingMessage(texts, null, null, { from: '10.11.2026', to: null, nights: null })).toContain(
      'תאריך כניסה: 10.11.2026',
    );
  });

  it('drops a dangling dash from the subject when no apartment is named', () => {
    expect(buildBookingSubject(texts, null)).toBe('בקשת הזמנה');
  });
});

describe('booking message in English', () => {
  const texts = en.booking.message;

  it('says the same things in English', () => {
    expect(buildBookingMessage(texts, 'Gefen Apartment', 2)).toBe(
      "Hello, I'd like to check availability and book Gefen Apartment.\nThe dates that suit me: \nNumber of guests: 2",
    );
    expect(buildBookingSubject(texts, 'Gefen Apartment')).toBe('Booking request - Gefen Apartment');
    expect(buildBookingMessage(texts, null, 1, { from: '10.11.2026', to: '11.11.2026', nights: 1 })).toContain(
      '(1 night)',
    );
  });
});

describe('text helpers', () => {
  it('fills slots and leaves an unknown slot visible', () => {
    expect(fillTemplate('Up to {count} guests', { count: 4 })).toBe('Up to 4 guests');
    expect(fillTemplate('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });

  it('splits a description into paragraphs at blank lines', () => {
    expect(splitParagraphs('One\ntwo\n\nThree\n\n\n  \nFour')).toEqual(['One two', 'Three', 'Four']);
    expect(splitParagraphs('  \n')).toEqual([]);
  });
});

describe('links', () => {
  it('normalises Israeli phone numbers', () => {
    expect(toInternationalDigits('054-549-9445')).toBe('972545499445');
    expect(toInternationalDigits('+972 54 549 9445')).toBe('972545499445');
    expect(toInternationalDigits('00972545499445')).toBe('972545499445');
    expect(toInternationalDigits('123')).toBeNull();
  });

  it('encodes the message into the WhatsApp and mail links', () => {
    expect(whatsappLink('972545499445', 'שלום\nא')).toBe(
      'https://wa.me/972545499445?text=%D7%A9%D7%9C%D7%95%D7%9D%0A%D7%90',
    );
    expect(mailtoLink('a@b.co', 'x y', 'z&w')).toBe('mailto:a@b.co?subject=x%20y&body=z%26w');
  });

  it('builds a Gmail compose link that keeps ampersands, new lines and Hebrew inside the body', () => {
    expect(gmailComposeLink('a@b.co', 'x y', 'z&w\nא')).toBe(
      'https://mail.google.com/mail/?view=cm&fs=1&to=a%40b.co&su=x%20y&body=z%26w%0A%D7%90',
    );
  });

  it('builds a Gmail link with an empty subject and body', () => {
    expect(gmailComposeLink('a@b.co', '', '')).toBe('https://mail.google.com/mail/?view=cm&fs=1&to=a%40b.co&su=&body=');
  });

  it('builds a tel link in international form, and none for a number it cannot read', () => {
    expect(telLink('054-549-9445')).toBe('tel:+972545499445');
    expect(telLink('+972 54 549 9445')).toBe('tel:+972545499445');
    expect(telLink('123')).toBeNull();
    expect(telLink('')).toBeNull();
  });
});

describe('booking message with a name and a party', () => {
  const noDates = { from: null, to: null, nights: null };

  it('writes the name line after the greeting, in Hebrew and English', () => {
    expect(buildBookingMessage(he.booking.message, 'נוביליטי 2', null, noDates, { name: 'ישראל ישראלי' })).toBe(
      'שלום, אשמח לבדוק זמינות והזמנה בנוביליטי 2.\nשם: ישראל ישראלי\nהתאריכים שמתאימים לי: ',
    );
    expect(buildBookingMessage(en.booking.message, 'Nobility 2', null, noDates, { name: 'Dana Cohen' })).toBe(
      "Hello, I'd like to check availability and book Nobility 2.\nName: Dana Cohen\nThe dates that suit me: ",
    );
  });

  it('leaves the name for the guest to write when the field is empty, and leaves the line out when there is no field', () => {
    expect(buildBookingMessage(he.booking.message, null, null, noDates, { name: '' })).toBe(
      'שלום, אשמח לבדוק זמינות והזמנה.\nשם: \nהתאריכים שמתאימים לי: ',
    );
    expect(buildBookingMessage(he.booking.message, null, null, noDates, {})).not.toContain('שם:');
  });

  it('writes the couples and children after the total, with a plural only where one is needed', () => {
    const message = (couples: number, children: number, total: number) =>
      buildBookingMessage(he.booking.message, null, total, noDates, { split: { couples, children } });
    expect(message(2, 3, 7)).toContain('מספר אורחים: 7 (2 זוגות, 3 ילדים)');
    expect(message(1, 1, 3)).toContain('מספר אורחים: 3 (זוג אחד, ילד אחד)');
    expect(message(1, 0, 2)).toContain('מספר אורחים: 2 (זוג אחד)');
    expect(message(0, 4, 4)).toContain('מספר אורחים: 4 (4 ילדים)');
    expect(buildBookingMessage(en.booking.message, null, 5, noDates, { split: { couples: 2, children: 1 } })).toContain(
      'Number of guests: 5 (2 couples, 1 child)',
    );
  });

  it('writes only the total when the guest typed their own number, and nothing when there is none', () => {
    expect(buildBookingMessage(he.booking.message, null, 6, noDates, {})).toContain('מספר אורחים: 6');
    expect(buildBookingMessage(he.booking.message, null, 6, noDates, {})).not.toContain('(');
    expect(
      buildBookingMessage(he.booking.message, null, null, noDates, { split: { couples: 1, children: 0 } }),
    ).not.toContain('אורחים');
  });

  it('keeps a name that looks like a slot as it is, without filling it', () => {
    expect(buildBookingMessage(en.booking.message, null, null, noDates, { name: '{cabin} {count}' })).toContain(
      'Name: {cabin} {count}',
    );
  });
});
