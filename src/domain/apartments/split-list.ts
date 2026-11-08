/**
 * Splits the apartments of the home page into the ones shown at once and the rest, which sit folded until the visitor opens
 * them, so the page weighs the same whether the site has five apartments or sixteen. A number that is not a whole number of
 * at least one shows the whole list: a mistake must never hide apartments.
 * @param items the apartments in their order on the site
 * @param shown how many are shown before the fold
 */
export function splitList<T>(items: readonly T[], shown: number): { shown: T[]; rest: T[] } {
  if (!Number.isInteger(shown) || shown < 1) return { shown: [...items], rest: [] };
  return { shown: items.slice(0, shown), rest: items.slice(shown) };
}
