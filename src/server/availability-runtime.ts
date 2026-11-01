import { AVAILABILITY_CONFIG } from '@config/availability';
import { createAvailabilityCache } from './availability-cache';
import { createAvailabilityService } from './availability-service';
import { parseCalendarUrlMap } from './calendar-source';
import { createCalendarLoader } from './create-calendar-loader';
import { logAvailability } from './log';

/** The environment values the service is built from. */
export interface AvailabilityEnv {
  source: 'google' | 'sample';
  calendarUrlsJson: string | undefined;
  isDev: boolean;
}

let service: ReturnType<typeof createAvailabilityService> | undefined;

/**
 * Returns the one service of this server instance, built on first use so its cache is shared.
 * Sample calendars are honoured only on the dev server: a production setting of "sample" reads nothing.
 */
export function getAvailabilityService(env: AvailabilityEnv) {
  service ??= createAvailabilityService({
    loadCalendar: createCalendarLoader({
      mode: env.source === 'sample' && env.isDev ? 'sample' : 'google',
      urlMap: parseCalendarUrlMap(env.calendarUrlsJson),
      allowedHosts: AVAILABILITY_CONFIG.allowedCalendarHosts,
      fetchOptions: { timeoutMs: AVAILABILITY_CONFIG.fetchTimeoutMs, maxBytes: AVAILABILITY_CONFIG.maxCalendarBytes },
      now: () => new Date(),
    }),
    cache: createAvailabilityCache(),
    now: () => new Date(),
    log: logAvailability,
    config: AVAILABILITY_CONFIG,
  });
  return service;
}
