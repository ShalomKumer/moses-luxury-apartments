/**
 * Builds a `mailto:` link that opens a new message in the visitor's mail app, with the address, subject and body filled
 * in. A new line is written as CRLF (`%0D%0A`), the form RFC 6068 asks for, so every mail app keeps the line breaks.
 */
export function mailtoLink(address: string, subject: string, body: string): string {
  const lineBreaks = (text: string) => text.replace(/\r?\n/g, '\r\n');
  const query = [`subject=${encodeURIComponent(lineBreaks(subject))}`, `body=${encodeURIComponent(lineBreaks(body))}`];
  return `mailto:${address}?${query.join('&')}`;
}
