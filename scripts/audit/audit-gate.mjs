// The dependency audit gate (S14), pure: reads the JSON of `npm audit --json` and says what fails. Same threshold as
// `npm audit --audit-level=high` (high and critical), except that an advisory a person reviewed may pass until its date.

/** Severities that fail the audit. */
const FAILING = new Set(['high', 'critical']);

/**
 * The advisories of a report, once each: a vulnerability's `via` holds advisory objects (kept) and the names of other
 * vulnerable packages (skipped, their own advisory is counted where it is).
 * @returns {Map<string, { id: string, package: string, severity: string }>}
 */
function advisoriesOf(vulnerabilities) {
  const found = new Map();
  for (const vulnerability of Object.values(vulnerabilities)) {
    for (const via of vulnerability?.via ?? []) {
      if (typeof via !== 'object' || via === null) continue;
      const id =
        String(via.url ?? '')
          .split('/')
          .filter(Boolean)
          .pop() || String(via.source ?? 'unknown');
      if (!found.has(id)) found.set(id, { id, package: String(via.name ?? 'unknown'), severity: String(via.severity) });
    }
  }
  return found;
}

/**
 * @param {unknown} report the parsed output of `npm audit --json`
 * @param {{ id: string, package: string, reason: string, reviewUntil: string }[]} reviewed accepted advisories
 * @param {string} today "YYYY-MM-DD"
 * @returns {{ failures: string[], accepted: { id: string, package: string, reason: string, reviewUntil: string }[] }}
 */
export function evaluateAudit(report, reviewed, today) {
  const vulnerabilities = report && typeof report === 'object' ? report.vulnerabilities : undefined;
  if (!vulnerabilities || typeof vulnerabilities !== 'object') {
    const why = report && typeof report === 'object' && report.error ? ` (${JSON.stringify(report.error)})` : '';
    return { failures: [`the audit report could not be read${why}: nothing was checked`], accepted: [] };
  }
  const failures = [];
  const accepted = [];
  const advisories = advisoriesOf(vulnerabilities);
  for (const advisory of advisories.values()) {
    if (!FAILING.has(advisory.severity)) continue;
    const entry = reviewed.find((item) => item.id === advisory.id);
    if (!entry) {
      const link = advisory.id.startsWith('GHSA-') ? `: https://github.com/advisories/${advisory.id}` : '';
      failures.push(`${advisory.severity} advisory ${advisory.id} in ${advisory.package}${link}`);
    } else if (today > entry.reviewUntil) {
      failures.push(`${advisory.id} (${entry.package}) was accepted only until ${entry.reviewUntil}: review it again`);
    } else {
      accepted.push(entry);
    }
  }
  for (const entry of reviewed) {
    if (!advisories.has(entry.id)) {
      failures.push(
        `${entry.id} (${entry.package}) is no longer reported: take it off scripts/audit/reviewed-advisories.mjs`,
      );
    }
  }
  return { failures, accepted };
}
