/** The longest name the message takes, in characters (a name is short; a long text is a mistake or a paste). */
export const MAX_NAME_LENGTH = 60;

/**
 * The name a guest typed, made safe to put in the booking message: line breaks, tabs and other control characters become
 * single spaces, runs of spaces become one, the ends are trimmed, and the text is cut at {@link MAX_NAME_LENGTH}
 * characters. The name is never stored; it only goes into the message the guest sends.
 */
export function cleanName(raw: string): string {
  const spaced = raw
    .replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [...spaced].slice(0, MAX_NAME_LENGTH).join('').trim();
}
