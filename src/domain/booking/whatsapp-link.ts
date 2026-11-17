/** Builds a link that opens a WhatsApp chat with the number, the message already typed. */
export function whatsappLink(internationalDigits: string, message: string): string {
  return `https://wa.me/${internationalDigits}?text=${encodeURIComponent(message)}`;
}
