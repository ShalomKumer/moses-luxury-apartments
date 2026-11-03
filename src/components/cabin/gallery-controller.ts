import { fillTemplate } from '@domain/text/fill-template';

/** The parts of the gallery the controller works with. */
interface GalleryParts {
  items: HTMLAnchorElement[];
  dialog: HTMLDialogElement;
  image: HTMLImageElement;
  caption: HTMLElement;
  /** How the position is spoken, in the page's language: "{n} of {total}". */
  positionTemplate: string;
}

/** Finds the gallery's parts; returns null if the markup is incomplete, leaving the plain links working. */
function findParts(root: HTMLElement): GalleryParts | null {
  const dialog = root.querySelector<HTMLDialogElement>('[data-gallery-dialog]');
  const image = root.querySelector<HTMLImageElement>('[data-gallery-image]');
  const caption = root.querySelector<HTMLElement>('[data-gallery-caption]');
  const items = [...root.querySelectorAll<HTMLAnchorElement>('[data-gallery-item]')];
  if (!dialog || !image || !caption || items.length === 0) return null;
  return { items, dialog, image, caption, positionTemplate: root.dataset.positionTemplate ?? '{n}/{total}' };
}

/** Shows one photo in the viewer, with its position spoken. */
function showPhoto(parts: GalleryParts, index: number): void {
  const item = parts.items[index];
  const alt = item.dataset.alt ?? '';
  parts.image.src = item.href;
  parts.image.alt = alt;
  const position = fillTemplate(parts.positionTemplate, { n: index + 1, total: parts.items.length });
  parts.caption.textContent = `${alt} (${position})`;
}

/**
 * Turns the photo links into a viewer: native dialog (focus kept inside, Escape closes), arrows move, focus returns.
 * The arrow keys follow the page's direction: in a right-to-left page the right arrow goes back. The "all photos" button
 * opens the viewer at the first photo. Marks the gallery as enhanced, so the grid may hide what the viewer reaches.
 */
export function initGallery(root: HTMLElement): void {
  const parts = findParts(root);
  if (!parts) return;
  const rtl = getComputedStyle(root).direction === 'rtl';
  let current = 0;
  let opener: HTMLElement | null = null;
  const move = (delta: number) => {
    current = (current + delta + parts.items.length) % parts.items.length;
    showPhoto(parts, current);
  };
  const open = (index: number, from: HTMLElement) => {
    opener = from;
    current = index;
    showPhoto(parts, current);
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
}
