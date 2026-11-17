import { describe, expect, it } from 'vitest';
import { BARE_PROBE_PATH } from '../../../scripts/launch/live-checks.mjs';
import { requestsFor } from '../../../scripts/launch/live-requests.mjs';

const byName = (requests: ReturnType<typeof requestsFor>) => Object.fromEntries(requests.map((r) => [r.name, r]));

describe('requestsFor', () => {
  it('names each request after the answer live-checks.mjs expects, with the address it must ask', () => {
    const requests = byName(requestsFor('https://www.example.com'));
    expect(Object.keys(requests)).toEqual(['http', 'bare', 'home', 'robots', 'sitemap']);
    expect(requests.http.url).toBe('http://www.example.com/');
    expect(requests.bare.url).toBe(`https://example.com${BARE_PROBE_PATH}`);
    expect(requests.home.url).toBe('https://www.example.com/');
    expect(requests.robots.url).toBe('https://www.example.com/robots.txt');
    expect(requests.sitemap.url).toBe('https://www.example.com/sitemap.xml');
  });

  it('asks for the body of the pages whose text is read, and of nothing else', () => {
    const requests = byName(requestsFor('https://www.example.com', 'https://moses.acct.workers.dev'));
    expect(
      Object.entries(requests)
        .filter(([, r]) => r.body)
        .map(([name]) => name),
    ).toEqual(['home', 'robots', 'sitemap']);
  });

  it('adds the preview address only when one is given', () => {
    expect(byName(requestsFor('https://www.example.com'))).not.toHaveProperty('preview');
    const preview = byName(requestsFor('https://www.example.com', 'https://moses.acct.workers.dev')).preview;
    expect(preview.url).toBe('https://moses.acct.workers.dev/');
  });

  it('has no request for a bare domain when the live address has no www', () => {
    expect(Object.keys(byName(requestsFor('https://example.com')))).toEqual(['http', 'home', 'robots', 'sitemap']);
  });
});
