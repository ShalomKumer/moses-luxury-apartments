// Asks the launched site the questions of `live-checks.mjs` and prints what it answered:
//   npm run launch:live -- [https://www.host] [--preview https://something.workers.dev]
// Run by hand after a deployment, never inside `verify` (it needs the network and a live site). It only reads: five GET
// requests (six with a preview address) to the addresses it is given, nothing is stored and nothing is sent but the request.
import { readFileSync } from 'node:fs';
import { SITE_URL } from '../../src/config/site-url.ts';
import { checkLive } from './live-checks.mjs';
import { requestsFor } from './live-requests.mjs';
import { readArguments } from './read-arguments.mjs';

/** How long one request may take, in milliseconds. */
const TIMEOUT_MS = 10_000;

const USAGE = 'Usage: npm run launch:live -- [https://www.host] [--preview https://preview-address]';

/** Asks one address and returns what the check needs: the status, the headers (lower-case names) and the body, or why there was no answer. */
async function ask(url, { body = false } = {}) {
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) });
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: body ? await response.text() : undefined,
    };
  } catch (error) {
    return { error: error?.cause?.code ?? error?.name ?? 'no answer' };
  }
}

const parsed = readArguments(process.argv.slice(2), SITE_URL);
if ('error' in parsed) {
  console.error(`${parsed.error}
${USAGE}`);
  process.exit(1);
}
const { siteUrl, previewUrl } = parsed;
console.log(`Asking ${siteUrl}${previewUrl ? ` and ${previewUrl}` : ''} ...`);
const requests = requestsFor(siteUrl, previewUrl);
const answers = Object.fromEntries(
  await Promise.all(requests.map(async ({ name, url, body }) => [name, await ask(url, { body })])),
);

const findings = checkLive({
  siteUrl,
  headersText: readFileSync('public/_headers', 'utf8'),
  answers,
  previewUrl,
});
for (const { ok, check, detail } of findings) console.log(`${ok ? 'ok  ' : 'FAIL'}  ${check}: ${detail}`);

const failures = findings.filter((finding) => !finding.ok).length;
console.log(
  failures
    ? `\n${failures} check(s) failed.`
    : '\nAll checks passed. This proves only these questions; it is not a security audit.',
);
process.exit(failures ? 1 : 0);
