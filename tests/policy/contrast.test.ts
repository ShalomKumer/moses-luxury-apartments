import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readText, ROOT } from './helpers/source-files';

/** Reads every "--color-x: #rrggbb" token of tokens.css. */
function colorTokens(): Map<string, string> {
  const css = readText(join(ROOT, 'src/styles/tokens.css'));
  return new Map([...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
}

/** Returns the relative luminance of a #rrggbb colour (WCAG 2.1). */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Returns the contrast ratio of two colours. */
function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Text on background: 4.5:1. Every pair the pages use is listed here. */
const TEXT_PAIRS: [string, string][] = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text-muted', 'bg'],
  ['text-muted', 'surface'],
  ['link', 'bg'],
  ['link', 'surface'],
  ['link-hover', 'bg'],
  ['link-hover', 'surface'],
  ['on-accent', 'accent'],
  ['on-accent', 'accent-hover'],
  ['notice-text', 'notice-bg'],
  ['free-text', 'free-bg'],
  ['taken-text', 'taken-bg'],
  ['taken-text', 'surface'],
  ['unknown-text', 'unknown-bg'],
  ['selected-text', 'selected-bg'],
];

/** Edges of controls and the focus ring: 3:1. */
const EDGE_PAIRS: [string, string][] = [
  ['border', 'bg'],
  ['border', 'surface'],
  ['focus', 'bg'],
  ['focus', 'surface'],
  ['unknown-text', 'surface'],
  ['selected-bg', 'surface'],
];

describe('colour contrast (A1)', () => {
  const tokens = colorTokens();

  /** Measures a pair, failing clearly if a token is missing. */
  const ratio = ([fg, bg]: [string, string]) => {
    expect(tokens.has(fg), `--color-${fg}`).toBe(true);
    expect(tokens.has(bg), `--color-${bg}`).toBe(true);
    return contrast(tokens.get(fg)!, tokens.get(bg)!);
  };

  it.each(TEXT_PAIRS)('text %s on %s is at least 4.5:1', (fg, bg) => {
    expect(ratio([fg, bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(EDGE_PAIRS)('edge %s on %s is at least 3:1', (fg, bg) => {
    expect(ratio([fg, bg])).toBeGreaterThanOrEqual(3);
  });
});
