// What the live site must answer once it is launched (S2, S18, E3, E4): pure, the answers in and the findings out.
// The program that asks the questions is `check-live.mjs`; this file only judges the answers, so it is tested with made-up ones.
import { headersFor, parseHeadersFile } from '../headers/headers-file.mjs';

/** The path (with a query) the bare domain is asked for, to check that the path and the query survive the redirect. */
export const BARE_PROBE_PATH = '/en/?a=1';

/** The permanent redirects: 301 and 308. A temporary one (302, 307) is not enough, search engines would not move to the new address. */
const PERMANENT = [301, 308];

/**
 * @typedef {{ status?: number, headers?: Record<string, string>, body?: string, error?: string }} Answer
 *   one answer of the live site: the status, the headers with lower-case names, the body of a text file, or the reason there was none
 * @typedef {{ ok: boolean, check: string, detail: string }} Finding
 */

/** The host without its `www.` (the bare domain), or null when the address has no `www`. */
export function bareHost(siteUrl) {
  const { host } = new URL(siteUrl);
  return host.startsWith('www.') ? host.slice(4) : null;
}

/** A finding. */
const finding = (ok, check, detail) => ({ ok, check, detail });

/** The finding for a check whose request got no usable answer. */
function noAnswer(check, answer) {
  return finding(false, check, answer?.error ? `no answer: ${answer.error}` : 'no answer');
}

/** The finding of a check on a text file (robots.txt, sitemap.xml): the answer must be 200 and the body must pass `judge`. */
function textFileFinding(check, answer, judge) {
  if (answer?.status === 200) return judge(answer.body ?? '');
  if (answer?.status || answer?.error)
    return finding(false, check, `${check} answered ${answer.status ?? answer.error}`);
  return noAnswer(check, answer);
}

/**
 * Tells whether a redirect answer is permanent and goes exactly to the expected address. A relative `Location` is read against
 * the address that was asked (`requested`), as a browser does: `/` from the HTTP address is a loop on HTTP, not a redirect to HTTPS.
 */
function redirectsTo(answer, requested, expected) {
  if (!answer || !PERMANENT.includes(answer.status)) return false;
  const location = answer.headers?.location;
  return location !== undefined && new URL(location, requested).href === expected;
}

/** Tells whether a `X-Robots-Tag` value forbids indexing: `noindex`, or `none` (which means noindex and nofollow). */
function forbidsIndexing(value) {
  return value
    .toLowerCase()
    .split(',')
    .some((part) => ['noindex', 'none'].includes(part.split(':').at(-1).trim()));
}

/** Tells whether an HTML page has a robots meta tag that forbids indexing, whatever the order of the tag's attributes. */
function metaForbidsIndexing(html) {
  return (html.match(/<meta[^>]*>/gi) ?? []).some(
    (tag) => /name\s*=\s*["']robots["']/i.test(tag) && /content\s*=\s*["'][^"']*\b(noindex|none)\b/i.test(tag),
  );
}

/**
 * Reads a robots.txt as a crawler would, for the two things the launch depends on: whether it shuts out every crawler (a
 * `Disallow: /` in a group that includes `*`), and whether a line (not a comment) names the sitemap.
 * @returns {{ blocksEveryone: boolean, sitemaps: string[] }}
 */
function readRobots(body) {
  let agents = [];
  let lastWasAgent = false;
  let blocksEveryone = false;
  const sitemaps = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim();
    const colon = line.indexOf(':');
    if (colon === -1) {
      lastWasAgent = false;
      continue;
    }
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (field === 'user-agent') {
      agents = lastWasAgent ? [...agents, value] : [value];
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (field === 'disallow' && value === '/' && agents.includes('*')) blocksEveryone = true;
    if (field === 'sitemap') sitemaps.push(value);
  }
  return { blocksEveryone, sitemaps };
}

/**
 * Judges the answers of the live site.
 * @param {{ siteUrl: string, headersText: string, answers: Record<string, Answer>, previewUrl?: string }} options
 *   `siteUrl` the live address ("https://www.host"), `headersText` the text of `public/_headers`, `answers` by name:
 *   `http` (the HTTP address), `bare` (the bare domain, at BARE_PROBE_PATH), `home` (with its body), `robots`, `sitemap`
 *   and, when a preview address is given, `preview`
 * @returns {Finding[]} the findings, in a fixed order
 */
export function checkLive({ siteUrl: given, headersText, answers, previewUrl }) {
  const siteUrl = new URL(given).origin;
  const host = new URL(siteUrl).host;
  const bare = bareHost(siteUrl);
  const findings = [];
  const { http, bare: bareAnswer, home, robots, sitemap, preview } = answers;

  // HTTP goes to HTTPS, permanently (S2).
  if (!http?.status) findings.push(noAnswer('http-to-https', http));
  else {
    findings.push(
      finding(
        redirectsTo(http, `http://${host}/`, `${siteUrl}/`),
        'http-to-https',
        `http answered ${http.status}, to ${http.headers?.location ?? 'nowhere'}; expected a permanent redirect to ${siteUrl}/`,
      ),
    );
  }

  // The bare domain goes to www, permanently, keeping the path and the query (E3).
  if (bare !== null) {
    if (!bareAnswer?.status) findings.push(noAnswer('bare-to-www', bareAnswer));
    else {
      findings.push(
        finding(
          redirectsTo(bareAnswer, `https://${bare}${BARE_PROBE_PATH}`, `${siteUrl}${BARE_PROBE_PATH}`),
          'bare-to-www',
          `the bare domain answered ${bareAnswer.status}, to ${bareAnswer.headers?.location ?? 'nowhere'}; expected a permanent redirect to ${siteUrl}${BARE_PROBE_PATH}`,
        ),
      );
    }
  }

  // The home page answers, with the headers of the headers file (S2, S10) and without a noindex.
  if (home?.status !== 200)
    findings.push(
      finding(false, 'home', home?.status ? `the home page answered ${home.status}` : noAnswer('home', home).detail),
    );
  else {
    findings.push(finding(true, 'home', 'the home page answered 200'));
    const expected = headersFor(parseHeadersFile(headersText), '/', host);
    const entries = Object.entries(expected);
    if (entries.length === 0) {
      findings.push(
        finding(false, 'header', 'the headers file gives no header for the site, so there is nothing to compare'),
      );
    }
    for (const [name, value] of entries) {
      const actual = home.headers?.[name.toLowerCase()];
      findings.push(
        finding(
          actual === value,
          'header',
          actual === value
            ? `${name.toLowerCase()} is as in the headers file`
            : `${name.toLowerCase()} is ${actual === undefined ? 'missing' : `"${actual}"`}; expected "${value}"`,
        ),
      );
    }
    const robotsHeader = home.headers?.['x-robots-tag'] ?? '';
    const blocked = forbidsIndexing(robotsHeader) || metaForbidsIndexing(home.body ?? '');
    findings.push(
      finding(
        !blocked,
        'live-indexable',
        blocked
          ? `the live site forbids indexing (x-robots-tag: ${robotsHeader || 'none sent'}, or a robots meta tag)`
          : 'the live site does not forbid indexing',
      ),
    );
  }

  // robots.txt names the sitemap and does not shut out every crawler; the sitemap lists the home page (E4).
  findings.push(
    textFileFinding('robots', robots, (body) => {
      const { blocksEveryone, sitemaps } = readRobots(body);
      const named = sitemaps.includes(`${siteUrl}/sitemap.xml`);
      return finding(
        named && !blocksEveryone,
        'robots',
        blocksEveryone
          ? 'robots.txt shuts out every crawler (Disallow: / for *)'
          : `robots.txt must name ${siteUrl}/sitemap.xml on a Sitemap line`,
      );
    }),
  );
  findings.push(
    textFileFinding('sitemap', sitemap, (body) =>
      finding(body.includes(`<loc>${siteUrl}/</loc>`), 'sitemap', `sitemap.xml must list ${siteUrl}/`),
    ),
  );

  // A preview address of the host answers and forbids indexing (S18).
  if (previewUrl) {
    if (!preview?.status) findings.push(noAnswer('preview-noindex', preview));
    else {
      const sent = preview.headers?.['x-robots-tag'] ?? '';
      findings.push(
        finding(
          preview.status === 200 && forbidsIndexing(sent),
          'preview-noindex',
          preview.status !== 200
            ? `the preview address answered ${preview.status}, so it proves nothing`
            : sent
              ? `the preview address sends x-robots-tag: ${sent}`
              : 'the preview address does not forbid indexing',
        ),
      );
    }
  }
  return findings;
}
