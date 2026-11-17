import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { headersFor, parseHeadersFile } from '../../scripts/headers/headers-file.mjs';
import { SITE_URL } from '../../src/config/site-url';
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
    csp
      .split(';')
      .map((part) => part.trim().split(/\s+/))
      .filter((parts) => parts[0])
      .map(([name, ...values]) => [name, values]),
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

describe("the host's own addresses stay out of search engines (S18)", () => {
  /** Every rule of the headers file: its pattern and the lower-case names of its headers. */
  const rules = readText(join(ROOT, 'public/_headers'))
    .split(/\r?\n/)
    .reduce<{ pattern: string; names: string[] }[]>((found, line) => {
      if (!line.trim() || line.trim().startsWith('#')) return found;
      if (!line.startsWith(' ')) found.push({ pattern: line.trim(), names: [] });
      else found.at(-1)?.names.push(line.trim().split(':')[0].toLowerCase());
      return found;
    }, []);
  const noindexed = rules.filter((rule) => rule.names.includes('x-robots-tag')).map((rule) => rule.pattern);

  it('marks the workers.dev addresses of the host noindex, in the form the host documents', () => {
    expect(noindexed).toEqual(['https://:version.:subdomain.workers.dev/*']);
  });

  it('writes no pattern with more than one splat, which the host does not accept', () => {
    const splats = rules.filter((rule) => rule.pattern.split('*').length > 2).map((rule) => rule.pattern);
    expect(splats).toEqual([]);
  });

  it('never marks the whole site, so the live domain stays open to search engines', () => {
    expect(siteHeaders().has('x-robots-tag')).toBe(false);
  });

  it('gives noindex to a preview address and never to the live domain or the test server, by the real file', () => {
    const real = parseHeadersFile(readText(join(ROOT, 'public/_headers')));
    const liveHost = new URL(SITE_URL).host;
    expect(headersFor(real, '/', 'ahuzot-moses.some-account.workers.dev')).toHaveProperty('X-Robots-Tag', 'noindex');
    expect(headersFor(real, '/en/', 'abc12345-ahuzot-moses.some-account.workers.dev')).toHaveProperty(
      'X-Robots-Tag',
      'noindex',
    );
    expect(headersFor(real, '/', liveHost)).not.toHaveProperty('X-Robots-Tag');
    expect(headersFor(real, '/', liveHost.replace(/^www[.]/, ''))).not.toHaveProperty('X-Robots-Tag');
    expect(headersFor(real, '/', '127.0.0.1:4322')).not.toHaveProperty('X-Robots-Tag');
  });
});
