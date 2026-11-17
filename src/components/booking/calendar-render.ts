import { dateKeyParts, type DateKey } from '@domain/dates/date-key';
import { isSelectable, monthWeeks } from '@domain/dates/calendar-month';
import type { YearMonth } from '@domain/dates/month';
import { isBetween, type Range } from '@domain/dates/range-selection';

/** What the drawing needs: the months to draw, the visitor's today, the chosen range and the day that holds the focus. */
export interface RenderOptions {
  months: YearMonth[];
  today: DateKey;
  range: Range;
  /** The one day in the Tab order (the others are reached by the arrow keys). */
  focus: DateKey;
  /** A browser locale: "he-IL" or "en-GB". Names of months and days come from the browser, in that language. */
  locale: string;
  texts: { checkIn: string; checkOut: string; inStay: string };
}

/** A calendar day as a moment in UTC, so the browser's own time zone can never move it to another day. */
function atUtc(key: DateKey): Date {
  const { year, month, day } = dateKeyParts(key);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Builds an element with a class and, if given, its text (text only: nothing is ever written as HTML, S1). */
function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The headings of the seven columns, Sunday first: a short name on screen and the full name for a screen reader. */
function weekdayHeadings(locale: string): HTMLTableRowElement {
  const short = new Intl.DateTimeFormat(locale, {
    weekday: locale.startsWith('he') ? 'narrow' : 'short',
    timeZone: 'UTC',
  });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const row = element('tr');
  for (let index = 0; index < 7; index += 1) {
    // 2023-01-01 was a Sunday
    const day = new Date(Date.UTC(2023, 0, 1 + index));
    const heading = element('th', 'cal__weekday', short.format(day));
    heading.scope = 'col';
    heading.abbr = long.format(day);
    row.append(heading);
  }
  return row;
}

/** One day's button: the number on screen, the full date (and whether it is an end of the stay) for a screen reader. */
function dayButton(key: DateKey, o: RenderOptions, label: Intl.DateTimeFormat): HTMLButtonElement {
  const button = element('button', 'cal__day', String(dateKeyParts(key).day));
  button.type = 'button';
  button.dataset.date = key;
  const isStart = key === o.range.start;
  const isEnd = key === o.range.end;
  // a day between the ends is shaded on screen, so it says so in words too (not colour alone)
  const edge = isStart ? o.texts.checkIn : isEnd ? o.texts.checkOut : isBetween(o.range, key) ? o.texts.inStay : '';
  button.setAttribute('aria-label', edge ? `${label.format(atUtc(key))}, ${edge}` : label.format(atUtc(key)));
  button.disabled = !isSelectable(key, o.today);
  button.tabIndex = key === o.focus ? 0 : -1;
  if (isStart || isEnd) button.dataset.edge = isStart ? 'start' : 'end';
  if (isBetween(o.range, key)) button.dataset.between = '';
  if (key === o.today) button.dataset.today = '';
  return button;
}

/** Draws one month as a table (a heading, the weekdays, the weeks); every day is a real button. */
function monthSection(month: YearMonth, o: RenderOptions): HTMLElement {
  const title = new Intl.DateTimeFormat(o.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const label = new Intl.DateTimeFormat(o.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const section = element('section', 'cal');
  const heading = element('h3', 'cal__title', title.format(new Date(Date.UTC(month.year, month.month - 1, 1))));
  heading.id = `cal-${month.year}-${month.month}`;
  const table = element('table', 'cal__grid');
  table.setAttribute('aria-labelledby', heading.id);
  const head = element('thead');
  head.append(weekdayHeadings(o.locale));
  const body = element('tbody');
  for (const week of monthWeeks(month)) {
    const row = element('tr');
    for (const key of week) {
      const cell = element('td', 'cal__cell');
      if (key) cell.append(dayButton(key, o, label));
      row.append(cell);
    }
    body.append(row);
  }
  table.append(head, body);
  section.append(heading, table);
  return section;
}

/** Replaces the calendar's months with a fresh drawing of the given months. */
export function renderMonths(container: HTMLElement, o: RenderOptions): void {
  container.replaceChildren(...o.months.map((month) => monthSection(month, o)));
}
