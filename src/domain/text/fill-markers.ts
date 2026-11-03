/** A piece of a text: plain words, or a part still to fill (a marker the owner or the lawyer completes before launch). */
export type FillSegment = { kind: 'text'; value: string } | { kind: 'fill'; label: string; value: string };

/** The word each marker language opens its box with. */
const LABELS: Record<string, string> = { למילוי: 'למילוי:', 'TO FILL': 'To fill:' };

/** Matches "[למילוי: ...]" and "[TO FILL: ...]"; the part inside never holds a closing bracket. */
const MARKER = /\[(למילוי|TO FILL):\s*([^\]]*)\]/g;

/**
 * Splits a text at its parts still to fill, in order. A bracket that is never closed, or a text with no marker, stays
 * plain text, so a broken marker is visible on the page and `npm run launch:check` still catches it.
 */
export function splitFillMarkers(text: string): FillSegment[] {
  const segments: FillSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKER)) {
    if (match.index > last) segments.push({ kind: 'text', value: text.slice(last, match.index) });
    segments.push({ kind: 'fill', label: LABELS[match[1]], value: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: 'text', value: text.slice(last) });
  return segments;
}
