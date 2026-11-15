import { describe, expect, it } from 'vitest';
import { toInternationalDigits } from '@domain/booking/phone-number';
import { telLink } from '@domain/booking/tel-link';
import { SITE, WHATSAPP_PHONE } from '@config/site';

/** The business has one phone number (the user, 2026-11-15): it is the one shown, dialled, and given the booking messages (L11). */
describe('the business phone number', () => {
  it('is the one number the user kept, and nothing else is listed', () => {
    expect(SITE.phones.map((phone) => phone.display)).toEqual(['053-436-9490']);
  });

  it('is on WhatsApp, so the booking messages go to it', () => {
    expect(SITE.phones[0].whatsapp).toBe(true);
    expect(WHATSAPP_PHONE).toBe('053-436-9490');
  });

  it('turns into the international digits of the WhatsApp link and a tel link that dials', () => {
    expect(toInternationalDigits(WHATSAPP_PHONE)).toBe('972534369490');
    expect(telLink(WHATSAPP_PHONE)).toBe('tel:+972534369490');
  });

  it('never leaves the removed number behind in the site settings', () => {
    expect(JSON.stringify(SITE)).not.toMatch(/054-?549-?9445/);
  });
});
