/** The number of guests the page may offer: the largest capacity among the apartments, at least one. */
export function maxGuestsOf(capacities: number[]): number {
  return Math.max(1, ...capacities);
}

/** Keeps a chosen number of guests within an apartment's capacity; null (not chosen) stays null, and one above it resets. */
export function clampGuests(selected: number | null, max: number): number | null {
  if (selected === null || !Number.isInteger(selected) || selected < 1) return null;
  return selected > max ? null : selected;
}
