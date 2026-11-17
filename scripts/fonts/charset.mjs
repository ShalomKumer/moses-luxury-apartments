// The characters the site's web fonts keep: Hebrew with its points and marks, basic Latin, the punctuation and
// symbols the pages use. Everything else is cut away, so each font file stays small (docs/design/brand.md).

/** Inclusive code point ranges. */
export const RANGES = [
  [0x0020, 0x007e], // basic Latin: letters, digits, punctuation
  [0x00a0, 0x00a0], // no-break space
  [0x00b7, 0x00b7], // middle dot
  [0x0590, 0x05ff], // Hebrew letters, points, cantillation, geresh and gershayim
  [0x200c, 0x200f], // zero-width joiners and the left-to-right and right-to-left marks
  [0x2010, 0x2015], // hyphens and dashes
  [0x2018, 0x201e], // curly quotes
  [0x2022, 0x2022], // bullet
  [0x2026, 0x2026], // ellipsis
  [0x20aa, 0x20aa], // new shekel sign
  [0x2190, 0x2193], // arrows
];

/** The text to hand to the subsetter: every character of every range, once. */
export function subsetText() {
  return RANGES.flatMap(([from, to]) =>
    Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)),
  ).join('');
}

/** True when the character is kept by the subset. */
export function isKept(char) {
  const code = char.codePointAt(0);
  return RANGES.some(([from, to]) => code >= from && code <= to);
}
