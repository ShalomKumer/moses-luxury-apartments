// Turns findings into text for the terminal: file, place, risk and kind - never the secret itself (S19).

/** One line per finding. */
export function formatFinding(finding) {
  const where = finding.line > 0 ? `${finding.file}:${finding.line}` : finding.file;
  const commit = finding.commit ? ` (in commit ${finding.commit})` : '';
  return `[${finding.risk}] ${where}${commit}: ${finding.what} (${finding.rule})`;
}

/** The failure message, with what to do about it. */
export function formatReport(findings) {
  return [
    `Secret scan failed: ${findings.length} finding(s). The values are not printed.`,
    ...findings.map((finding) => `  ${formatFinding(finding)}`),
    'A secret that reached git is revoked and rotated, not just deleted (docs/standards.md, section 3).',
    'A reviewed false positive: put "secret-scan:allow" on that line.',
  ].join('\n');
}
