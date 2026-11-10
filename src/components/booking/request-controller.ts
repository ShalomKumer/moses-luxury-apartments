import { buildBookingMessage } from '@domain/booking/booking-message';
import { cleanName } from '@domain/booking/guest-name';
import { limitParty, maxChildren, maxCouples, parseCount, totalOf, typedTotal } from '@domain/booking/party';
import { resolveStay, toChosenDates, type StayProblem } from '@domain/booking/stay-dates';
import { toDateKey } from '@domain/dates/date-key';
import { fillTemplate } from '@domain/text/fill-template';
import { applyMessage, readLinkTarget } from './booking-links';

/** The elements of the request the controller drives. The apartment select is missing on an apartment's own page. */
interface Parts {
  unit: HTMLSelectElement | null;
  checkIn: HTMLInputElement;
  checkOut: HTMLInputElement;
  couples: HTMLInputElement;
  children: HTMLInputElement;
  /** The total of guests: worked out from the two counters, or the guest's own number. */
  total: HTMLInputElement;
  name: HTMLInputElement;
  /** The note that tells a number was lowered to the apartment's guests. */
  note: HTMLElement;
  problem: HTMLElement;
  message: HTMLElement;
}

/** Finds the request's parts; null if the page lacks one, so a broken page leaves the plain links working. */
function findParts(root: HTMLElement): Parts | null {
  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector);
  const unit = find<HTMLSelectElement>('[data-request-unit]');
  const checkIn = find<HTMLInputElement>('[data-stay-in]');
  const checkOut = find<HTMLInputElement>('[data-stay-out]');
  const couples = find<HTMLInputElement>('[data-counter="couples"] [data-counter-input]');
  const children = find<HTMLInputElement>('[data-counter="children"] [data-counter-input]');
  const total = find<HTMLInputElement>('[data-request-guests]');
  const name = find<HTMLInputElement>('[data-request-name]');
  const note = find('[data-guests-note]');
  const problem = find('[data-request-problem]');
  const message = find('[data-request-message]');
  return checkIn && checkOut && couples && children && total && name && note && problem && message
    ? { unit, checkIn, checkOut, couples, children, total, name, note, problem, message }
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

/**
 * The apartment the request is for and how many guests it takes: the chosen option of the select, or the apartment the
 * page itself is about (named by `data-unit-name`) when there is no select. "Any" has no name and the largest capacity.
 */
function chosenUnit(root: HTMLElement, parts: Parts, anyMax: number): { name: string | null; max: number } {
  if (!parts.unit) return { name: root.dataset.unitName?.trim() || null, max: anyMax };
  const option = parts.unit.selectedOptions[0];
  if (!parts.unit.value || !option) return { name: null, max: anyMax };
  return { name: option.textContent?.trim() ?? null, max: Number(option.dataset.max) || anyMax };
}

/** Leaves only the digits in a counting field (at most three), writing the cleaned text back when it changed. */
function keepDigits(field: HTMLInputElement): void {
  const digits = field.value.replace(/\D/g, '').slice(0, 3);
  if (digits !== field.value) field.value = digits;
}

/** Marks a counter's button as unable to go further (it stays focusable, so focus is never lost). */
function setLimit(button: Element | null, atLimit: boolean): void {
  if (!button) return;
  if (atLimit) button.setAttribute('aria-disabled', 'true');
  else button.removeAttribute('aria-disabled');
}

/**
 * Starts the booking request: keeps the WhatsApp and email links, the message preview and the notes in step with the
 * fields. The party is couples (two people each), children (one each) and a total that is worked out from them, or typed
 * over by the guest; every number stays within the apartment's guests. The name goes into the message only and is never
 * stored. Without this script the plain links still open a message with no dates and no apartment.
 */
export function initBookingRequest(root: HTMLElement): void {
  const parts = findParts(root);
  const target = readLinkTarget(root);
  const problems = readProblems(root);
  if (!parts || !target || !problems) return;
  const anyMax = Number(root.dataset.maxGuests) || 1;
  const capNote = root.dataset.capNote ?? '';
  // the fields are shown only once this script runs: without it they would do nothing
  root.dataset.enhanced = '';

  /** True while the total is the guest's own number (typed over the worked-out one). */
  let typedOver = false;

  const update = () => {
    const today = toDateKey(new Date());
    const unit = chosenUnit(root, parts, anyMax);

    // the counters stay within the apartment's guests (couples first, the children take what is left)
    const party = limitParty(parseCount(parts.couples.value), parseCount(parts.children.value), unit.max);
    if (parseCount(parts.couples.value) !== party.couples) parts.couples.value = String(party.couples);
    if (parseCount(parts.children.value) !== party.children) parts.children.value = String(party.children);

    // the total: the guest's own number, or worked out from the counters (empty while both are 0)
    const worked = totalOf(party.couples, party.children);
    const typedRaw = parseCount(parts.total.value);
    const total = typedOver ? typedTotal(parts.total.value, unit.max) : worked > 0 ? worked : null;
    if (typedOver) {
      if (typedRaw > unit.max) parts.total.value = String(unit.max);
    } else {
      parts.total.value = total === null ? '' : String(total);
    }
    parts.note.textContent =
      party.lowered || (typedOver && typedRaw > unit.max) ? fillTemplate(capNote, { count: unit.max }) : '';

    // the buttons say when a counter cannot go further
    const rows = { couples: party.couples, children: party.children };
    setLimit(root.querySelector('[data-counter="couples"] [data-counter-less]'), rows.couples === 0);
    setLimit(
      root.querySelector('[data-counter="couples"] [data-counter-more]'),
      rows.couples >= maxCouples(unit.max) || maxChildren(unit.max, rows.couples + 1) < rows.children,
    );
    setLimit(root.querySelector('[data-counter="children"] [data-counter-less]'), rows.children === 0);
    setLimit(
      root.querySelector('[data-counter="children"] [data-counter-more]'),
      rows.children >= maxChildren(unit.max, rows.couples),
    );

    parts.checkIn.min = today;
    parts.checkOut.min = parts.checkIn.value || today;
    const stay = resolveStay(parts.checkIn.value, parts.checkOut.value, today);
    parts.problem.textContent = stay.problem ? problems[stay.problem] : '';

    // the split is written only while the total is the worked-out one (or the guest typed the same number)
    const split = total !== null && total === worked ? { couples: party.couples, children: party.children } : undefined;
    const message = buildBookingMessage(target.texts, unit.name, total, toChosenDates(stay), {
      name: cleanName(parts.name.value),
      split,
    });
    applyMessage(root, { ...target, cabinName: unit.name }, message);
    parts.message.textContent = message;
  };

  // typing: only digits; a counter or the apartment changing makes the total worked out again, typing the total makes it the guest's own
  root.addEventListener('input', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement)) return;
    if (field === parts.couples || field === parts.children) {
      keepDigits(field);
      typedOver = false;
    } else if (field === parts.total) {
      keepDigits(field);
      typedOver = true;
    }
    update();
  });

  // leaving an emptied total gives the worked-out one back; an emptied counter shows 0
  root.addEventListener('focusout', (event) => {
    const field = event.target;
    if (field === parts.total && parts.total.value === '') typedOver = false;
    if ((field === parts.couples || field === parts.children) && (field as HTMLInputElement).value === '') {
      (field as HTMLInputElement).value = '0';
    }
    update();
  });

  // the plus and minus buttons
  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-counter-less], [data-counter-more]');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    const field = button.closest('[data-counter]')?.querySelector<HTMLInputElement>('[data-counter-input]');
    if (!field) return;
    field.value = String(Math.max(0, parseCount(field.value) + (button.hasAttribute('data-counter-more') ? 1 : -1)));
    typedOver = false;
    update();
  });

  // the apartment and the dates
  root.addEventListener('change', update);
  update();
}
