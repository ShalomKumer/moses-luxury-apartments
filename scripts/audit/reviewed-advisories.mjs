// Advisories in our dependencies that a person looked at and accepted for now (iron rule S14). Every entry has a reason and
// a date up to which it stands; after that date the audit fails again, so the decision is looked at, not forgotten. An
// entry the audit no longer reports fails too: take it off. A new entry is the user's decision, never added to make the
// audit pass (docs/compliance.md, S14).

/** @type {{ id: string, package: string, reason: string, reviewUntil: string }[]} */
export const REVIEWED_ADVISORIES = [
  {
    id: 'GHSA-fc5q-39xc-vjpf',
    package: 'picomatch',
    reason:
      'ReDoS in glob matching with no patched release yet (4.0.7 is the latest); reached only through build tools (vite, vitest, tinyglobby) that match patterns from our own configuration, never anything a visitor sends; the site ships as static files',
    reviewUntil: '2026-12-17',
  },
];
