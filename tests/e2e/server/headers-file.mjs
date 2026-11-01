// Reads a Cloudflare-style `_headers` file, so the test server can send the same headers as the host. Pure: text in, rules out.

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

/** Tells whether a path pattern covers a request path: `/*` is everything, `/a/*` a folder, anything else is exact. */
function covers(pattern, pathname) {
  if (pattern === '/*') return true;
  if (pattern.endsWith('/*')) return pathname.startsWith(pattern.slice(0, -1));
  return pattern === pathname;
}

/**
 * The headers to send for a path. A header named by several rules is joined with a comma, as the host does.
 * @param {{ pattern: string, headers: [string, string][] }[]} rules
 * @param {string} pathname
 * @returns {Record<string, string>}
 */
export function headersFor(rules, pathname) {
  const found = {};
  for (const rule of rules) {
    if (!covers(rule.pattern, pathname)) continue;
    for (const [name, value] of rule.headers) {
      found[name] = name in found ? `${found[name]}, ${value}` : value;
    }
  }
  return found;
}
