/**
 * Where a photo really is inside the box that holds it. The viewer's picture fills its stage and fits the photo inside
 * (`object-fit: contain`), so the dark bars beside a wide or tall photo are part of the picture element but not of the photo.
 * Pure: the controller measures the box and the photo's own size, and only asks this.
 */

/** A rectangle in pixels, from the box's top-left corner. */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The part of a `boxWidth` x `boxHeight` box that a photo of `naturalWidth` x `naturalHeight` covers when it is fitted
 * inside and centred (never cropped, never stretched). With a size that is not a positive number (a photo not loaded yet)
 * the photo is taken to cover the whole box, so no tap near it is ever read as a tap on empty space.
 */
export function containedArea(boxWidth: number, boxHeight: number, naturalWidth: number, naturalHeight: number): Area {
  const whole = { x: 0, y: 0, width: Math.max(0, boxWidth), height: Math.max(0, boxHeight) };
  const sizes = [boxWidth, boxHeight, naturalWidth, naturalHeight];
  if (!sizes.every((size) => Number.isFinite(size) && size > 0)) return whole;
  const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return { x: (boxWidth - width) / 2, y: (boxHeight - height) / 2, width, height };
}

/** Whether a point (measured from the box's top-left corner) lies inside the area, its edges included. */
export function isInsideArea(area: Area, x: number, y: number): boolean {
  return x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height;
}
