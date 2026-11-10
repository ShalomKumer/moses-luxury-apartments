/** The number of guests the page may offer: the largest capacity among the apartments, at least one. */
export function maxGuestsOf(capacities: number[]): number {
  return Math.max(1, ...capacities);
}
