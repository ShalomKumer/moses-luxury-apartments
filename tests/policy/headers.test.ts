import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listFiles, readText, ROOT } from './helpers/source-files';

/** Reads the headers file's rules for "/*" as a map of lower-case header name to value. */
function siteHeaders(): Map<string, string> {
  const lines = readText(join(ROOT, 'public/_headers')).split(/\r?\n/);
  const headers = new Map<string, string>();
  let inSiteBlock = false;
  for (const line of lines) {
    if (!line.startsWith(' ') && line.trim()) inSiteBlock = line.trim() === '/*';
    else if (inSiteBlock && line.includes(':')) {
      const [name, ...value] = line.trim().split(':');
      headers.set(name.toLowerCase(), value.join(':').trim());
    }
  }
  return headers;
}

/** Splits a CSP into its directives. */
function cspDirectives(csp: string): Map<string, string[]> {
  return new Map(
    csp.split(';').map((part) => part.trim().split(/\s+/)).filter((parts) => parts[0]).map(([name, ...values]) => [name, values]),
  );
}

describe('security headers (S2, S10)', () => {
  const headers = siteHeaders();

  it('sends HSTS for a year, nosniff, deny framing, a referrer policy and a permissions policy', () => {
    expect(headers.get('strict-transport-security')).toMatch(/max-age=31536000/);
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('permissions-policy')).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });

  it('has a CSP that allows only our own host and no inline or eval code', () => {
    const csp = cspDirectives(headers.get('content-security-policy') ?? '');
    for (const directive of ['default-src', 'script-src', 'style-src', 'img-src', 'connect-src', 'font-src']) {
      expect(csp.get(directive), directive).toEqual(["'self'"]);
    }
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
    expect(csp.get('object-src')).toEqual(["'none'"]);
  });

  it('opens nothing to other origins (S12)', () => {
    const setsCors = /['"`]Access-Control-Allow-Origin['"`]/i;
    const corsAnywhere = listFiles('src', ['.ts']).filter((file) => setsCors.test(readText(file)));
    expect(corsAnywhere).toEqual([]);
    expect(headers.has('access-control-allow-origin')).toBe(false);
  });
});
