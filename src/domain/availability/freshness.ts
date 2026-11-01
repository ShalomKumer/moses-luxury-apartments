/** Tells whether a reading taken at updatedAt (ISO time) is younger than maxAgeMs at now. */
export function isFresh(updatedAt: string, now: Date, maxAgeMs: number): boolean {
  const takenAt = Date.parse(updatedAt);
  if (Number.isNaN(takenAt)) return false;
  const age = now.getTime() - takenAt;
  return age >= 0 && age < maxAgeMs;
}
