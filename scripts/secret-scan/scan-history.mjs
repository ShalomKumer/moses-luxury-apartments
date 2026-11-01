// Runs git to read the whole history (every branch), then hands the text to the parser.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { COMMIT_MARKER, parseHistory } from './parse-history.mjs';

/**
 * The git command: every branch, merge commits as a combined diff (what a conflict resolution added), the same
 * 'a/' and 'b/' prefixes whatever the user's git config says, and file names printed as they are.
 */
const LOG_ARGS = [
  '-c',
  'core.quotepath=false',
  'log',
  '--all',
  '--cc',
  '--no-color',
  '--no-ext-diff',
  '--no-renames',
  '--src-prefix=a/',
  '--dst-prefix=b/',
  `--format=${COMMIT_MARKER}%H`,
];

/** Scans every added line in every commit of every branch; returns the findings and the number of commits read. */
export function scanHistory() {
  if (!existsSync('.git')) return { findings: [], commits: 0 };
  const log = execFileSync('git', LOG_ARGS, { encoding: 'utf8', maxBuffer: 512_000_000 });
  return { findings: parseHistory(log), commits: log.split(COMMIT_MARKER).length - 1 };
}
