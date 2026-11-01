// The rules of the secret scan (S19): what a secret looks like, and how risky it is when found.
// A line that carries ALLOW_MARKER is skipped, for a reviewed false positive.

/** Written on a line to say "this was looked at and is not a secret". */
export const ALLOW_MARKER = 'secret-scan:allow';

/** Each rule: id, risk level, what it finds (plain words, never the value) and the pattern. */
export const RULES = [
  { id: 'private-key', risk: 'high', what: 'a private key block', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/ },
  { id: 'aws-access-key', risk: 'high', what: 'an AWS access key id', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { id: 'google-api-key', risk: 'high', what: 'a Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'github-token', risk: 'high', what: 'a GitHub token', pattern: /\b(?:gh[pousr]_[0-9A-Za-z]{36,}|github_pat_[0-9A-Za-z_]{40,})\b/ },
  { id: 'slack-token', risk: 'high', what: 'a Slack token', pattern: /\bxox[abprs]-[0-9A-Za-z-]{10,}/ },
  { id: 'stripe-live-key', risk: 'high', what: 'a live Stripe key', pattern: /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}/ },
  { id: 'jwt', risk: 'medium', what: 'a signed JSON web token', pattern: /\beyJ[0-9A-Za-z_-]{10,}\.eyJ[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}/ },
  { id: 'connection-string', risk: 'high', what: 'an address with a user name and password in it', pattern: /\b[a-z][a-z0-9+.-]{0,30}:\/\/[^\s:@/'"<>{}]+:[^\s@/'"<>{}]{3,}@[^\s'"]+/i },
  { id: 'calendar-secret-address', risk: 'high', what: 'a private Google Calendar address', pattern: /calendar\.google\.com\/calendar\/ical\/[^\s'"`]+/i },
  { id: 'secret-assignment', risk: 'medium', what: 'a key, token or password set to a long literal', pattern: /(?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key)[\w.-]*\s*[:=]\s*['"][^'"<>{}$\s]{12,}['"]/i },
];
