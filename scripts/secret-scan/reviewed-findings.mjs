// Findings in the git history that a person looked at and accepted. History cannot be edited to add the allow marker,
// so each one is listed here with the reason. A new entry is the user's decision, never added to make the scan pass.

/** [commit (short id), file, rule, reason] */
const REVIEWED = [
  [
    '06e9532',
    'tests/unit/server/calendar-source.test.ts',
    'calendar-secret-address',
    'a made-up address (abc/private-xyz) used by a unit test; no real calendar',
  ],
];

/** True when a finding from the history is one of the reviewed ones. */
export function isReviewed(finding) {
  return REVIEWED.some(
    ([commit, file, rule]) => finding.commit === commit && finding.file === file && finding.rule === rule,
  );
}
