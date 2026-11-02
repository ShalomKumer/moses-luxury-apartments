import { applyMessage, readLinkTarget } from '@components/booking/booking-links';
import { buildBookingMessage } from '@domain/booking/booking-message';
import { clampGuests } from '@domain/booking/guests';
import { resolveStay, toChosenDates, type StayProblem } from '@domain/booking/stay-dates';
import { toDateKey } from '@domain/dates/date-key';

/** The elements of the bar the controller drives. */
interface Parts {
  unit: HTMLSelectElement;
  checkIn: HTMLInputElement;
  checkOut: HTMLInputElement;
  guests: HTMLSelectElement;
  problem: HTMLElement;
  message: HTMLElement;
}

/** Finds the bar's parts; null if the page lacks one, so a broken page leaves the plain links working. */
function findParts(root: HTMLElement): Parts | null {
  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const unit = find<HTMLSelectElement>('[data-request-unit]');
  const checkIn = find<HTMLInputElement>('[data-stay-in]');
  const checkOut = find<HTMLInputElement>('[data-stay-out]');
  const guests = find<HTMLSelectElement>('[data-request-guests]');
  const problem = find('[data-request-problem]');
  const message = find('[data-request-message]');
  return unit && checkIn && checkOut && guests && problem && message
    ? { unit, checkIn, checkOut, guests, problem, message }
    : null;
}

/** Reads the short notes shown for a date problem, written by the page in its language. */
function readProblems(root: HTMLElement): Record<StayProblem, string> | null {
  try {
    return JSON.parse(root.dataset.problems ?? '') as Record<StayProblem, string>;
  } catch {
    return null;
  }
}

/** The chosen apartment's name (null for "any") and how many guests it takes. */
function chosenUnit(parts: Parts, anyMax: number): { name: string | null; max: number } {
  const option = parts.unit.selectedOptions[0];
  if (!parts.unit.value || !option) return { name: null, max: anyMax };
  return { name: option.textContent?.trim() ?? null, max: Number(option.dataset.max) || anyMax };
}

/**
 * Starts the booking-request bar: keeps the WhatsApp and email links, the message preview and the note about a bad
 * date in step with the fields. Without it the plain links still open a message with no apartment and no dates.
 */
export function initRequestBar(root: HTMLElement): void {
  const parts = findParts(root);
  const target = readLinkTarget(root);
  const problems = readProblems(root);
  if (!parts || !target || !problems) return;
  const anyMax = Number(root.dataset.maxGuests) || 1;
  // the fields are shown only once this script runs: without it they would do nothing
  root.dataset.enhanced = '';

  const update = () => {
    const today = toDateKey(new Date());
    const unit = chosenUnit(parts, anyMax);
    for (const option of parts.guests.options) {
      option.disabled = Boolean(option.value) && Number(option.value) > unit.max;
    }
    const guests = clampGuests(Number(parts.guests.value) || null, unit.max);
    if (guests === null) parts.guests.value = '';

    parts.checkIn.min = today;
    parts.checkOut.min = parts.checkIn.value || today;
    const stay = resolveStay(parts.checkIn.value, parts.checkOut.value, today);
    parts.problem.textContent = stay.problem ? problems[stay.problem] : '';

    const message = buildBookingMessage(target.texts, unit.name, guests, toChosenDates(stay));
    applyMessage(root, { ...target, cabinName: unit.name }, message);
    parts.message.textContent = message;
  };

  root.addEventListener('change', update);
  update();
}
