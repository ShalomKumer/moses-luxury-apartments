/** Turns a written phone number ("050-123-4567", "+972 50...") into international digits, or null if it cannot. */
export function toInternationalDigits(phone: string, countryCode = '972'): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith(countryCode)) return digits.length > countryCode.length + 6 ? digits : null;
  if (digits.startsWith('0') && digits.length >= 9) return countryCode + digits.slice(1);
  return null;
}
