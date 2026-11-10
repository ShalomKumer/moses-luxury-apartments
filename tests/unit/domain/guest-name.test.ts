import { describe, expect, it } from 'vitest';
import { cleanName, MAX_NAME_LENGTH } from '@domain/booking/guest-name';

describe('cleanName', () => {
  it('keeps an ordinary name, in Hebrew or English', () => {
    expect(cleanName('ישראל ישראלי')).toBe('ישראל ישראלי');
    expect(cleanName("Dana O'Neil-Cohen")).toBe("Dana O'Neil-Cohen");
  });

  it('trims the ends and turns runs of spaces into one', () => {
    expect(cleanName('  Dana   Cohen  ')).toBe('Dana Cohen');
  });

  it('turns line breaks and tabs into spaces, so a pasted name cannot add a line to the message', () => {
    expect(cleanName('Dana\nCohen')).toBe('Dana Cohen');
    expect(cleanName('Dana\r\n\r\nCohen\tLevi')).toBe('Dana Cohen Levi');
    expect(cleanName('Dana Cohen Levi')).toBe('Dana Cohen Levi');
  });

  it('drops other control characters', () => {
    expect(cleanName('Da\u0000na\u0007')).toBe('Da na');
  });

  it('is empty for an empty field or one with only spaces', () => {
    expect(cleanName('')).toBe('');
    expect(cleanName('   \n\t ')).toBe('');
  });

  it('cuts a long text at the limit, counting characters and not code units', () => {
    expect(cleanName('a'.repeat(200))).toHaveLength(MAX_NAME_LENGTH);
    const emoji = cleanName('😀'.repeat(100));
    expect([...emoji]).toHaveLength(MAX_NAME_LENGTH);
  });

  it('leaves the characters of a link or a message alone: they are encoded where the message is sent', () => {
    expect(cleanName('A&B #1 100% <b>')).toBe('A&B #1 100% <b>');
  });
});
