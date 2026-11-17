/**
 * The facts an apartment is shown with as badges ("Wi-Fi", "3 jacuzzis", "dry sauna"). Pure: no page, no dictionary.
 * A badge is only ever a fact the owner wrote in the apartment's own text, so every kind has a pattern that its
 * features list must match in both languages (`missingEvidence`): a badge without its line in the text fails the build (H1).
 */

/** Every kind of badge, in the order the page shows them. */
export const HIGHLIGHT_KINDS = [
  'wifi',
  'shabbos-kitchen',
  'jacuzzi',
  'sauna',
  'pool',
  'view',
  'balcony',
  'courtyard',
  'loft',
  'separate-bedroom',
  'stone',
  'murals',
] as const;

export type HighlightKind = (typeof HIGHLIGHT_KINDS)[number];

/** One badge of an apartment; `count` is for the kinds that can be many ("3 jacuzzis"). */
export interface Highlight {
  kind: HighlightKind;
  count?: number;
}

/** The kinds every apartment has: they are shown on its page but are not what sets it apart, so a list row skips them. */
const EVERYWHERE: readonly HighlightKind[] = ['wifi', 'shabbos-kitchen'];

/** The kinds a count may go with. */
export const COUNTED_KINDS: readonly HighlightKind[] = ['jacuzzi', 'loft'];

/** What the features text of each language must say for a badge to be allowed. */
export const EVIDENCE: Record<HighlightKind, { he: RegExp; en: RegExp }> = {
  wifi: { he: /אינטרנט אלחוטי|Wi-Fi/, en: /Wi-Fi/i },
  'shabbos-kitchen': { he: /מטבח.*שבת/, en: /Shabbos|Shabbat|Sabbath/i },
  jacuzzi: { he: /ג׳קוזי/, en: /jacuzzi/i },
  sauna: { he: /סאונה/, en: /sauna/i },
  pool: { he: /בריכ/, en: /pool/i },
  view: { he: /נוף/, en: /view/i },
  balcony: { he: /מרפסת/, en: /balcon/i },
  courtyard: { he: /חצר/, en: /courtyard|yard/i },
  loft: { he: /לופט/, en: /loft/i },
  'separate-bedroom': { he: /חדר שינה.*נפרד/, en: /separate.*bedroom/i },
  stone: { he: /אבן/, en: /stone/i },
  murals: { he: /ציורי קיר/, en: /mural/i },
};

/** Puts the badges in the page's order and drops a kind that is listed twice (the first one stays). */
export function orderHighlights(list: readonly Highlight[]): Highlight[] {
  const seen = new Set<HighlightKind>();
  const unique = list.filter((item) => (seen.has(item.kind) ? false : (seen.add(item.kind), true)));
  return unique.sort((a, b) => HIGHLIGHT_KINDS.indexOf(a.kind) - HIGHLIGHT_KINDS.indexOf(b.kind));
}

/** The badges that set an apartment apart (not Wi-Fi, not the Shabbos kitchen), in order, at most `max`. */
export function specialHighlights(list: readonly Highlight[], max: number): Highlight[] {
  return orderHighlights(list)
    .filter((item) => !EVERYWHERE.includes(item.kind))
    .slice(0, Math.max(0, max));
}

/** The words of one language: a plain label for every kind and, for the countable ones, a template with {count}. */
export interface HighlightTexts {
  plain: Record<HighlightKind, string>;
  counted: Partial<Record<HighlightKind, string>>;
}

/** The label of one badge: "3 jacuzzis" when a count above one is given and the kind has a counted template, else the plain label. */
export function highlightLabel(item: Highlight, texts: HighlightTexts): string {
  const template = texts.counted[item.kind];
  return template && item.count && item.count > 1
    ? template.replace('{count}', String(item.count))
    : texts.plain[item.kind];
}

/**
 * The kinds that have no line in the features text of a language. `features` is every feature in that language.
 * An empty answer means every badge is backed by the text.
 */
export function missingEvidence(
  list: readonly Highlight[],
  features: readonly string[],
  language: 'he' | 'en',
): HighlightKind[] {
  return list
    .filter((item) => !features.some((feature) => EVIDENCE[item.kind][language].test(feature)))
    .map((item) => item.kind);
}

/** Whether the list has Wi-Fi: the owner's standing rule is that every apartment lists it. */
export function hasWifi(list: readonly Highlight[]): boolean {
  return list.some((item) => item.kind === 'wifi');
}
