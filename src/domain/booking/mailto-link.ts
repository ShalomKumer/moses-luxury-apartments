/** Builds a mailto: link that opens the guest's mail app with the subject and body filled in. */
export function mailtoLink(address: string, subject: string, body: string): string {
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
