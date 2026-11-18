// Advisories in our dependencies that a person looked at and accepted for now (iron rule S14). Every entry has a reason and
// a date up to which it stands; after that date the audit fails again, so the decision is looked at, not forgotten. An
// entry the audit no longer reports fails too: take it off. A new entry is the user's decision, never added to make the
// audit pass (docs/compliance.md, S14).
//
// Empty since 2026-11-18: the picomatch advisory GHSA-fc5q-39xc-vjpf, accepted on 2026-11-17 because no patched release
// existed, stopped being reported by npm, and the gate demanded its removal.

/** @type {{ id: string, package: string, reason: string, reviewUntil: string }[]} */
export const REVIEWED_ADVISORIES = [];
