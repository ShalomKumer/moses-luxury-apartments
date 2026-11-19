/**
 * Whether the visitor's main way of pointing is a finger (a phone or a tablet): there a `mailto:` link opens the mail app
 * with a new message, while Gmail's address only opens its website. A computer with a mouse or a trackpad has no
 * mail app set up as often as it has a browser signed in to Gmail, so it gets Gmail's compose window instead.
 */
export function prefersMailApp(): boolean {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}
