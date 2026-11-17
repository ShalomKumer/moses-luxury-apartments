import { clampViewMonth, isSelectable, monthIsReachable, monthOf, viewMonthFor } from '@domain/dates/calendar-month';
import { dateKeyFromParts, toDateKey, type DateKey } from '@domain/dates/date-key';
import { isNavigationKey, navigate } from '@domain/dates/day-navigation';
import { parseFlex, type FlexDays } from '@domain/dates/flex-days';
import { formatDateKey } from '@domain/dates/format-date';
import { shiftMonth, type YearMonth } from '@domain/dates/month';
import { EMPTY_RANGE, pickDay, rangeNights, type Range } from '@domain/dates/range-selection';
import { fillTemplate } from '@domain/text/fill-template';
import { renderMonths } from './calendar-render';

/** The words the page gives the picker, in the page's language. */
interface PickerTexts {
  placeholder: string;
  summary: string;
  summaryStart: string;
  hintStart: string;
  hintEnd: string;
  hintDone: string;
  checkIn: string;
  checkOut: string;
  inStay: string;
  nightsOne: string;
  nights: string;
}

/** Reads the texts from the page; null if they are missing, so a broken page leaves the picker closed and the links plain. */
function readTexts(root: HTMLElement): PickerTexts | null {
  try {
    return JSON.parse(root.dataset.texts ?? '') as PickerTexts;
  } catch {
    return null;
  }
}

/** Finds the picker's parts in the page; null if one is missing. */
function findParts(root: HTMLElement) {
  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const parts = {
    open: find<HTMLButtonElement>('[data-picker-open]'),
    summary: find('[data-picker-summary]'),
    dialog: find<HTMLDialogElement>('[data-picker-dialog]'),
    hint: find('[data-picker-hint]'),
    months: find('[data-picker-months]'),
    previous: find<HTMLButtonElement>('[data-picker-prev]'),
    next: find<HTMLButtonElement>('[data-picker-next]'),
    clear: find<HTMLButtonElement>('[data-picker-clear]'),
    done: find<HTMLButtonElement>('[data-picker-done]'),
    close: find<HTMLButtonElement>('[data-picker-close]'),
    stayIn: find<HTMLInputElement>('[data-stay-in]'),
    stayOut: find<HTMLInputElement>('[data-stay-out]'),
    flex: find<HTMLInputElement>('[data-stay-flex]'),
  };
  const missing = Object.values(parts).some((part) => part === null);
  return missing ? null : (parts as { [K in keyof typeof parts]: NonNullable<(typeof parts)[K]> });
}

/** Marks an arrow as unable to go further; it stays focusable, so focus is never lost. */
function setArrow(button: HTMLElement, enabled: boolean): void {
  if (enabled) button.removeAttribute('aria-disabled');
  else button.setAttribute('aria-disabled', 'true');
}

/**
 * Starts the date picker of the booking request: a window with the calendar, "from date to date", and the flexibility
 * buttons. A click on a day makes it the check-in, and the next later day the check-out; an earlier day starts over, and a
 * day that passed or lies more than a year ahead cannot be chosen. The choice goes into three hidden fields and a
 * `change` event that the request's script listens to; nothing is stored, sent or looked up, and no day is marked free or
 * taken (H7, L3). Every day is a button, the arrow keys follow the page's direction, Escape closes the window and the
 * browser returns the focus to the field (A3).
 */
export function initDatePicker(root: HTMLElement): void {
  const parts = findParts(root);
  const texts = readTexts(root);
  if (!parts || !texts) return;
  const locale = root.dataset.locale ?? 'he-IL';
  const rtl = root.hasAttribute('data-rtl');
  const wide = window.matchMedia('(min-width: 48rem)');
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-flex]')];

  let range: Range = EMPTY_RANGE;
  let flex: FlexDays = 0;
  let today: DateKey = toDateKey(new Date());
  /** The first month on screen; a second one follows on a wide screen. */
  let view: YearMonth = monthOf(today);
  /** The day that holds the focus (the only one in the Tab order). */
  let focus: DateKey = today;

  const visibleMonths = () => (wide.matches ? 2 : 1);

  /** Keeps the first month on screen within the months that hold a day that can be chosen. */
  const clampView = (candidate: YearMonth): YearMonth => clampViewMonth(candidate, today, visibleMonths());

  /** Moves the view so a day is on screen. */
  const showDay = (day: DateKey) => {
    view = viewMonthFor(day, view, today, visibleMonths());
  };

  /** The text of the field: the placeholder, a check-in waiting for a check-out, or the stay with its nights. */
  const summaryText = (): string => {
    if (!range.start) return texts.placeholder;
    if (!range.end) return fillTemplate(texts.summaryStart, { from: formatDateKey(range.start) });
    const count = rangeNights(range) ?? 0;
    const nights = count === 1 ? texts.nightsOne : fillTemplate(texts.nights, { count });
    return fillTemplate(texts.summary, { from: formatDateKey(range.start), to: formatDateKey(range.end), nights });
  };

  /** Writes the choice where the request's script reads it, and tells it. */
  const publish = () => {
    parts.stayIn.value = range.start ?? '';
    parts.stayOut.value = range.end ?? '';
    parts.flex.value = String(flex);
    parts.summary.textContent = summaryText();
    if (range.start) parts.summary.removeAttribute('data-empty');
    else parts.summary.setAttribute('data-empty', '');
    root.dispatchEvent(new Event('change', { bubbles: true }));
  };

  /** Draws the months, the arrows, the hint and the pressed flexibility button. */
  const render = () => {
    const months = Array.from({ length: visibleMonths() }, (_, index) => shiftMonth(view, index));
    renderMonths(parts.months, { months, today, range, focus, locale, texts });
    setArrow(parts.previous, monthIsReachable(shiftMonth(view, -1), today));
    setArrow(parts.next, monthIsReachable(shiftMonth(view, visibleMonths()), today));
    parts.hint.textContent = !range.start ? texts.hintStart : !range.end ? texts.hintEnd : texts.hintDone;
    for (const chip of chips) chip.setAttribute('aria-pressed', String(parseFlex(chip.dataset.flex ?? '') === flex));
  };

  /** Draws again and puts the focus on a day's button. */
  const renderAndFocus = (day: DateKey) => {
    focus = day;
    render();
    parts.months.querySelector<HTMLElement>(`[data-date="${day}"]`)?.focus();
  };

  parts.open.addEventListener('click', () => {
    today = toDateKey(new Date());
    const start = range.start && isSelectable(range.start, today) ? range.start : today;
    focus = start;
    view = clampView(monthOf(start));
    parts.dialog.showModal();
    renderAndFocus(focus);
  });

  parts.months.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-date]');
    const day = button?.dataset.date;
    if (!day || button.disabled) return;
    range = pickDay(range, day);
    publish();
    renderAndFocus(day);
  });

  parts.months.addEventListener('keydown', (event) => {
    const day = (event.target as Element).closest<HTMLElement>('[data-date]')?.dataset.date;
    if (!day || event.altKey || event.ctrlKey || event.metaKey || !isNavigationKey(event.key)) return;
    event.preventDefault();
    const target = navigate(day, event.key, rtl, today);
    showDay(target);
    renderAndFocus(target);
  });

  /** An arrow shows the month before or after; the focus stays on the same day number when that month has it. */
  const step = (delta: number) => (event: Event) => {
    const button = event.currentTarget as HTMLElement;
    if (button.getAttribute('aria-disabled') === 'true') return;
    view = clampView(shiftMonth(view, delta));
    focus = isSelectable(focus, today) ? focus : today;
    // the focus day must be on screen, or the Tab order would lose it
    const shown = [view, ...(visibleMonths() === 2 ? [shiftMonth(view, 1)] : [])];
    if (!shown.some((month) => month.year === monthOf(focus).year && month.month === monthOf(focus).month)) {
      const firstDay = dateKeyFromParts(view.year, view.month, 1);
      focus = firstDay >= today ? firstDay : today;
    }
    render();
    button.focus();
  };
  parts.previous.addEventListener('click', step(-1));
  parts.next.addEventListener('click', step(1));

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      flex = parseFlex(chip.dataset.flex ?? '');
      publish();
      render();
    });
  }

  parts.clear.addEventListener('click', () => {
    range = EMPTY_RANGE;
    flex = 0;
    publish();
    renderAndFocus(focus);
  });

  parts.done.addEventListener('click', () => parts.dialog.close());
  parts.close.addEventListener('click', () => parts.dialog.close());

  // a window resized or turned between one month and two is drawn again, with the same day in focus
  wide.addEventListener('change', () => {
    if (!parts.dialog.open) return;
    view = clampView(view);
    showDay(focus);
    render();
  });
}
