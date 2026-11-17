// Reads the output of `git log --cc -p` and finds secrets on the lines a commit ADDED. Pure: it only parses text.
// A merge commit shows only what its conflict resolution changed (a combined diff, one prefix column per parent).
import { forbiddenFileFinding } from './forbidden-files.mjs';
import { rulesInLine } from './scan-text.mjs';

/** The marker the git command prints before each commit, so the parser knows where one starts. */
export const COMMIT_MARKER = '@@commit ';

/** Finds the secrets in a history log; each finding also names the commit (short id). */
export function parseHistory(log) {
  const findings = [];
  let commit = '';
  let file = '';
  let lineNo = 0;
  let columns = 1; // prefix columns before the text of a line: 1 for a normal diff, one per parent in a merge
  let inHunk = false; // a '+++ ' line is a file header only before the first hunk, never inside one
  for (const raw of log.split(/\r?\n/)) {
    if (raw.startsWith(COMMIT_MARKER)) {
      commit = raw.slice(COMMIT_MARKER.length, COMMIT_MARKER.length + 7);
      inHunk = false;
    } else if (raw.startsWith('diff ')) {
      inHunk = false;
    } else if (!inHunk && raw.startsWith('+++ ')) {
      file = raw.startsWith('+++ b/') ? raw.slice(6) : '';
      const name = file ? forbiddenFileFinding(file) : null;
      if (name) findings.push({ ...name, commit });
    } else if (raw.startsWith('@@')) {
      inHunk = true;
      columns = Math.max(1, /^@+/.exec(raw)[0].length - 1);
      const start = /\+(\d+)/.exec(raw);
      lineNo = start ? Number(start[1]) - 1 : 0;
    } else if (inHunk && !raw.startsWith('\\')) {
      const prefix = raw.slice(0, columns);
      if (prefix.includes('+')) {
        lineNo += 1;
        for (const rule of rulesInLine(raw.slice(columns))) {
          findings.push({ file, line: lineNo, rule: rule.id, risk: rule.risk, what: rule.what, commit });
        }
      } else if (!prefix.includes('-')) {
        lineNo += 1;
      }
    }
  }
  return findings;
}
