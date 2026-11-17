// The secret scan (S13, S19): the project's files, the build in dist/, and with --history every commit.
// Pattern based: it finds known formats and forbidden file names, not every possible secret.
import { forbiddenFileFinding } from './forbidden-files.mjs';
import { pathsToScan, readScannable } from './list-sources.mjs';
import { formatReport } from './report.mjs';
import { isReviewed } from './reviewed-findings.mjs';
import { scanHistory } from './scan-history.mjs';
import { scanText } from './scan-text.mjs';

const withHistory = process.argv.includes('--history');
const paths = pathsToScan();
const findings = [];
for (const path of paths) {
  const forbidden = forbiddenFileFinding(path);
  if (forbidden) findings.push(forbidden);
  const text = readScannable(path);
  if (text !== null) findings.push(...scanText(path, text));
}

let commits = 0;
if (withHistory) {
  const history = scanHistory();
  findings.push(...history.findings.filter((finding) => !isReviewed(finding)));
  commits = history.commits;
}

if (findings.length > 0) {
  console.error(formatReport(findings));
  process.exit(1);
}
const scope = withHistory ? `${paths.length} files and ${commits} commits` : `${paths.length} files`;
console.log(`Secret scan passed: ${scope}. It finds known formats only; it cannot prove there is no secret.`);
