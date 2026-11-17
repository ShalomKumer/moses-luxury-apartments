// `npm run audit:prod`: asks npm for the audit of every installed package and applies the gate of `audit-gate.mjs`
// (S14). It needs the network (npm asks the registry) and only reads; it stores and changes nothing.
import { spawnSync } from 'node:child_process';
import { evaluateAudit } from './audit-gate.mjs';
import { REVIEWED_ADVISORIES } from './reviewed-advisories.mjs';

/** Runs `npm audit --json` and returns its parsed output, or null when npm printed something that is not JSON. */
function readAudit() {
  const run = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 });
  try {
    return JSON.parse(run.stdout);
  } catch {
    return null;
  }
}

const today = new Date().toISOString().slice(0, 10);
const { failures, accepted } = evaluateAudit(readAudit(), REVIEWED_ADVISORIES, today);

for (const entry of accepted) {
  console.log(`accepted until ${entry.reviewUntil}: ${entry.id} (${entry.package}) - ${entry.reason}`);
}
if (failures.length > 0) {
  console.error(`Audit failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log('Audit passed: no high or critical advisory outside the reviewed list.');
