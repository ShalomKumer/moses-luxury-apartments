// Finds secrets in one text. Pure: no files, no git. A finding never holds the secret itself (S19).
import { ALLOW_MARKER, RULES } from './patterns.mjs';

/** A very long line (a minified bundle) is read in overlapping windows, so no pattern works on a huge string. */
const WINDOW = 4000;
const STEP = 3800;

/** Splits a long line into overlapping windows; a short line is one window. */
function windows(line) {
  if (line.length <= WINDOW) return [line];
  const parts = [];
  for (let start = 0; start < line.length; start += STEP) parts.push(line.slice(start, start + WINDOW));
  return parts;
}

/** Returns the rules that match one line, once each. */
export function rulesInLine(line) {
  if (line.includes(ALLOW_MARKER)) return [];
  const parts = windows(line);
  return RULES.filter((rule) => parts.some((part) => rule.pattern.test(part)));
}

/** @typedef {{ file: string, line: number, rule: string, risk: string, what: string, commit?: string }} Finding */

/**
 * Scans a text: one finding per rule per line, as file, line number, rule id, risk and a plain description.
 * @returns {Finding[]}
 */
export function scanText(file, text) {
  return text
    .split(/\r?\n/)
    .flatMap((line, index) =>
      rulesInLine(line).map((rule) => ({ file, line: index + 1, rule: rule.id, risk: rule.risk, what: rule.what })),
    );
}
