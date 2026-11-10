import { swipeDirection } from '@domain/gallery/swipe';
import { fillTemplate } from '@domain/text/fill-template';

/** The parts of the gallery the controller works with. */
interface GalleryParts {
  items: HTMLAnchorElement[];
  dialog: HTMLDialogElement;
  /** The dark stage the photo fits inside; a finger's movement across it is a swipe. */
  stage: HTMLElement;
  image: HTMLImageElement;
  caption: HTMLElement;
  /** How the position is spoken, in the page's language: "{n} of {total}". */
  positionTemplate: string;
}

/** Finds the gallery's parts; returns null if the markup is incomplete, leaving the plain links working. */
function findParts(root: HTMLElement): GalleryParts | null {
  const dialog = root.querySelector<HTMLDialogElement>('[data-gallery-dialog]');
  const stage = root.querySelector<HTMLElement>('[data-gallery-stage]');
  const image = root.querySelector<HTMLImageElement>('[data-gallery-image]');
  const caption = root.querySelector<HTMLElement>('[data-gallery-caption]');
  const items = [...root.querySelectorAll<HTMLAnchorElement>('[data-gallery-item]')];
  if (!dialog || !stage || !image || !caption || items.length === 0) return null;
  return { items, dialog, stage, image, caption, positionTemplate: root.dataset.positionTemplate ?? '{n}/{total}' };
}

/** The photo files already asked for, kept so the browser does not drop a half-loaded one. */
const requested = new Map<string, HTMLImageElement>();

/** Starts loading one photo file (a neighbour of the photo shown) and returns the image that holds it. */
function request(url: string): HTMLImageElement {
  let image = requested.get(url);
  if (!image) {
    image = new Image();
    image.src = url;
    requested.set(url, image);
  }
  return image;
}

/** Whether the visitor asked the system for less motion. */
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Shows one photo in the viewer, with its position spoken. The words change at once. The picture changes after the new file
 * is ready (the old one stays until then, so the frame is never empty), with a short fade unless the visitor wants less
 * motion; `latest` makes a quick series of presses end on the last one. The two neighbours start loading, so the next
 * press finds its photo ready.
 */
function showPhoto(parts: GalleryParts, index: number, latest: { value: number }, instant: boolean): void {
  const total = parts.items.length;
  const item = parts.items[index];
  const alt = item.dataset.alt ?? '';
  const position = fillTemplate(parts.positionTemplate, { n: index + 1, total });
  parts.caption.textContent = `${alt} (${position})`;

  latest.value += 1;
  const mine = latest.value;
  const swap = () => {
    if (mine !== latest.value) return;
    parts.image.src = item.href;
    parts.image.alt = alt;
    if (!instant && !calm())
      parts.image.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
  };
  if (instant) swap();
  else {
    const ready = request(item.href);
    ready.decode().then(swap, swap);
  }

  if (total > 1) {
    request(parts.items[(index + 1) % total].href);
    request(parts.items[(index - 1 + total) % total].href);
  }
}

/**
 * Turns the photo links into a viewer: native dialog (focus kept inside, Escape closes), arrows move, focus returns.
 * The arrow keys follow the page's direction: in a right-to-left page the right arrow goes back. The "all photos" button
 * opens the viewer at the first photo. On a touch screen a swipe across the photo moves too (`swipeDirection`). Marks the
 * gallery as enhanced, so the grid may hide what the viewer reaches.
 */
export function initGallery(root: HTMLElement): void {
  const parts = findParts(root);
  if (!parts) return;
  const rtl = getComputedStyle(root).direction === 'rtl';
  const latest = { value: 0 };
  let current = 0;
  let opener: HTMLElement | null = null;
  const move = (delta: number) => {
    current = (current + delta + parts.items.length) % parts.items.length;
    showPhoto(parts, current, latest, false);
  };
  const open = (index: number, from: HTMLElement) => {
    opener = from;
    current = index;
    showPhoto(parts, current, latest, true);
    parts.dialog.showModal();
  };
  root.dataset.enhanced = '';

  parts.items.forEach((item, index) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      open(index, item);
    });
  });
  root.querySelector<HTMLElement>('[data-gallery-all]')?.addEventListener('click', (event) => {
    open(0, event.currentTarget as HTMLElement);
  });
  root.querySelector('[data-gallery-prev]')?.addEventListener('click', () => move(-1));
  root.querySelector('[data-gallery-next]')?.addEventListener('click', () => move(1));
  root.querySelector('[data-gallery-close]')?.addEventListener('click', () => parts.dialog.close());
  parts.dialog.addEventListener('keydown', (event) => {
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) move(1);
    if (event.key === back) move(-1);
  });
  parts.dialog.addEventListener('close', () => opener?.focus());

  // a swipe: where a finger went down and where it came up (touch only: a mouse has the arrows)
  let start: { x: number; y: number } | null = null;
  parts.stage.addEventListener('pointerdown', (event) => {
    start = event.pointerType === 'touch' ? { x: event.clientX, y: event.clientY } : null;
  });
  parts.stage.addEventListener('pointerup', (event) => {
    if (!start || parts.items.length < 2) return;
    const result = swipeDirection(event.clientX - start.x, event.clientY - start.y, rtl);
    start = null;
    if (result === 'next') move(1);
    if (result === 'previous') move(-1);
  });
  parts.stage.addEventListener('pointercancel', () => {
    start = null;
  });
}
