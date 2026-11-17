// Reads a Cloudflare-style `_headers` file, so the test server and the live-site check can use the same headers as the host. Pure: text in, rules out.

/**
 * Splits the file into rules: a line that starts in the first column is a path pattern, the indented lines under it
 * are its headers. Blank lines, comments (#) and header lines before any pattern are ignored.
 * @param {string} text
 * @returns {{ pattern: string, headers: [string, string][] }[]}
 */
export function parseHeadersFile(text) {
  const rules = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      rules.push({ pattern: line.trim(), headers: [] });
      continue;
    }
    const colon = line.indexOf(':');
    const rule = rules.at(-1);
    if (colon === -1 || !rule) continue;
    rule.headers.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
  }
  return rules;
}

/** Splits a pattern written with an address ("https://*.workers.dev/*") into its host and path; null for a pattern that is only a path. */
function splitAddress(pattern) {
  const match = /^https?:\/\/([^/]+)(\/.*)?$/i.exec(pattern);
  return match ? { host: match[1].toLowerCase(), path: match[2] ?? '/' } : null;
}

/**
 * Tells whether a host pattern covers a request host, as the host's own matcher does: a label that is `:name` (a placeholder) is
 * exactly one label, a `*` (a splat, one at most) is one or more characters, every other label is itself. The port and the case are ignored.
 */
function hostMatches(hostPattern, host) {
  const bare = (value) => value.toLowerCase().replace(/:\d+$/, '');
  // A host has letters, digits, hyphens and dots only, so the labels are the only parts to translate.
  const labels = bare(hostPattern)
    .split('.')
    .map((label) => (/^:[a-z]\w*$/.test(label) ? '[^.]+' : label.split('*').join('.+')));
  return new RegExp(`^${labels.join('[.]')}$`).test(bare(host));
}

/**
 * Tells whether a pattern covers a request: `/*` is everything, `/a/*` a folder, anything else is exact. A pattern that starts
 * with an address (`https://*.workers.dev/*`) covers only requests to a matching host, so it never covers a request whose host is unknown.
 */
function covers(pattern, pathname, host) {
  const address = splitAddress(pattern);
  if (address) return host !== undefined && hostMatches(address.host, host) && covers(address.path, pathname);
  if (pattern === '/*') return true;
  if (pattern.endsWith('/*')) return pathname.startsWith(pattern.slice(0, -1));
  return pattern === pathname;
}

/**
 * The headers to send for a request. A header named by several rules is joined with a comma, as the host does.
 * @param {{ pattern: string, headers: [string, string][] }[]} rules
 * @param {string} pathname
 * @param {string} [host] the request's host (the Host header); a rule written for an address needs it
 * @returns {Record<string, string>}
 */
export function headersFor(rules, pathname, host) {
  const found = {};
  for (const rule of rules) {
    if (!covers(rule.pattern, pathname, host)) continue;
    for (const [name, value] of rule.headers) {
      found[name] = name in found ? `${found[name]}, ${value}` : value;
    }
  }
  return found;
}
