/**
 * The apartments an apartment's page recommends: the ones that follow it in the list, wrapping back to the start, at most
 * `count` and never the apartment itself. Every apartment is so recommended by about as many pages as it recommends, and the
 * page weighs the same whether the site has five apartments or fifty. An id that is not in the list gives the first `count`.
 * @param items the apartments in their order on the site
 * @param currentId the id of the apartment whose page this is
 * @param count how many to return
 */
export function nextApartments<T extends { id: string }>(items: readonly T[], currentId: string, count: number): T[] {
  if (!Number.isInteger(count) || count < 1) return [];
  const at = items.findIndex((item) => item.id === currentId);
  const others = at === -1 ? [...items] : [...items.slice(at + 1), ...items.slice(0, at)];
  return others.slice(0, count);
}
