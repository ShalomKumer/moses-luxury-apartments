/** How many days either side of the chosen dates the guest could move (the options of the user's screenshot). */
export const FLEX_OPTIONS = [0, 1, 2, 3, 7] as const;
export type FlexDays = (typeof FLEX_OPTIONS)[number];

/** Reads a value from the page back into an option; anything that is not one of them means "exact dates". */
export function parseFlex(value: string): FlexDays {
  const number = Number(value);
  return (FLEX_OPTIONS as readonly number[]).includes(number) && value.trim() !== '' ? (number as FlexDays) : 0;
}
