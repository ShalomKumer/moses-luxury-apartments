/** A month as year and month number (1-12). */
export interface YearMonth {
  year: number;
  month: number;
}

/** Returns the month a number of months after (or before, if negative) the given one. */
export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}
