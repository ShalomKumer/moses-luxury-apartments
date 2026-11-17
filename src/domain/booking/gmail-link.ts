/** Builds a link that opens Gmail's compose window in the browser, with the address, subject and body filled in. */
export function gmailComposeLink(address: string, subject: string, body: string): string {
  const query = [
    `view=cm`,
    `fs=1`,
    `to=${encodeURIComponent(address)}`,
    `su=${encodeURIComponent(subject)}`,
    `body=${encodeURIComponent(body)}`,
  ];
  return `https://mail.google.com/mail/?${query.join('&')}`;
}
