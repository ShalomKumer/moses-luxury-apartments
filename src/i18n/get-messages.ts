import type { Locale } from './locales';
import { en } from './messages/en';
import { he } from './messages/he';
import type { Messages } from './messages/types';

const MESSAGES: Record<Locale, Messages> = { he, en };

/** Returns every text of the site in a language. */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
