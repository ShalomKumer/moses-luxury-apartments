import { toDateKey } from '@domain/dates/date-key';
import { resolveCalendarUrl } from './calendar-source';
import { fetchCalendarText, type FetchCalendarOptions } from './fetch-calendar';
import { buildSampleCalendar } from './sample-calendar';

/** Loads one cabin's calendar feed as text. */
export type CalendarLoader = (cabinId: string) => Promise<string>;

/** Where calendars come from: the owner's Google calendars, or made-up ones in development. */
export interface CalendarLoaderSettings {
  mode: 'google' | 'sample';
  urlMap: Record<string, string>;
  allowedHosts: readonly string[];
  fetchOptions: FetchCalendarOptions;
  now: () => Date;
  fetchImpl?: typeof fetch;
}

/** Builds the loader for the chosen source. */
export function createCalendarLoader(settings: CalendarLoaderSettings): CalendarLoader {
  if (settings.mode === 'sample') {
    return async (cabinId) => buildSampleCalendar(cabinId, toDateKey(settings.now()));
  }
  return (cabinId) => {
    const url = resolveCalendarUrl(cabinId, settings.urlMap, settings.allowedHosts);
    return fetchCalendarText(url, settings.fetchOptions, settings.fetchImpl);
  };
}
