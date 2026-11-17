import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { request, type IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { headersFor, parseHeadersFile } from '../../../scripts/headers/headers-file.mjs';
import { createStaticServer } from '../../e2e/server/serve-static.mjs';

describe('parseHeadersFile and headersFor', () => {
  const text = [
    '# a comment',
    '/*',
    '  X-One: 1',
    "  Content-Security-Policy: default-src 'self'; img-src 'self'",
    '',
    '/private/*',
    '  X-Two: 2',
    '/exact',
    '  X-Three: 3',
  ].join('\r\n');
  const rules = parseHeadersFile(text);

  it('reads patterns and their headers, keeping a colon or semicolon inside a value', () => {
    expect(rules.map((rule) => rule.pattern)).toEqual(['/*', '/private/*', '/exact']);
    expect(headersFor(rules, '/')['Content-Security-Policy']).toBe("default-src 'self'; img-src 'self'");
  });

  it('applies a folder pattern to its files only, and an exact pattern to that path only', () => {
    expect(headersFor(rules, '/private/a.html')).toMatchObject({ 'X-One': '1', 'X-Two': '2' });
    expect(headersFor(rules, '/privateer')).not.toHaveProperty('X-Two');
    expect(headersFor(rules, '/exact')).toHaveProperty('X-Three', '3');
    expect(headersFor(rules, '/exact/more')).not.toHaveProperty('X-Three');
  });

  it('joins a header named by two rules with a comma', () => {
    const joined = parseHeadersFile('/*\n  X-A: one\n/a\n  X-A: two');
    expect(headersFor(joined, '/a')).toEqual({ 'X-A': 'one, two' });
  });

  it('ignores an empty file, a header before any pattern and a line without a colon', () => {
    expect(parseHeadersFile('')).toEqual([]);
    expect(parseHeadersFile('  X-Early: 1\n/*\n  not-a-header\n')).toEqual([{ pattern: '/*', headers: [] }]);
  });
});

describe('a rule written for one host (preview addresses, S18)', () => {
  // The form Cloudflare documents for workers.dev: placeholders (each one label), at most one splat.
  const rules = parseHeadersFile(
    [
      '/*',
      '  X-All: 1',
      'https://:version.:subdomain.workers.dev/*',
      '  X-Robots-Tag: noindex',
      'https://only.example.dev/docs/*',
      '  X-Docs: 1',
      'https://*.splat.dev/*',
      '  X-Splat: 1',
    ].join('\n'),
  );

  it('applies on a matching host, whatever its labels, and the port and the case are ignored', () => {
    expect(headersFor(rules, '/', 'moses.acct.workers.dev')).toMatchObject({ 'X-All': '1', 'X-Robots-Tag': 'noindex' });
    expect(headersFor(rules, '/en/', 'abc-123-moses.acct.workers.dev:443')).toHaveProperty('X-Robots-Tag', 'noindex');
    expect(headersFor(rules, '/', 'MOSES.Acct.Workers.DEV')).toHaveProperty('X-Robots-Tag', 'noindex');
  });

  it('reads a placeholder as exactly one label, as the host does', () => {
    expect(headersFor(rules, '/', 'moses.workers.dev')).not.toHaveProperty('X-Robots-Tag');
    expect(headersFor(rules, '/', 'a.b.acct.workers.dev')).not.toHaveProperty('X-Robots-Tag');
  });

  it('reads a splat as one or more characters', () => {
    expect(headersFor(rules, '/', 'a.b.splat.dev')).toHaveProperty('X-Splat', '1');
    expect(headersFor(rules, '/', 'splat.dev')).not.toHaveProperty('X-Splat');
  });

  it('never applies on the live domain, on the test server, or when the host is unknown', () => {
    expect(headersFor(rules, '/', 'www.mosesluxuryapartments.com')).toEqual({ 'X-All': '1' });
    expect(headersFor(rules, '/', 'mosesluxuryapartments.com')).toEqual({ 'X-All': '1' });
    expect(headersFor(rules, '/', '127.0.0.1:4322')).toEqual({ 'X-All': '1' });
    expect(headersFor(rules, '/')).toEqual({ 'X-All': '1' });
  });

  it('does not match a host that only ends in the same letters', () => {
    expect(headersFor(rules, '/', 'evil.moses.workers.dev.attacker.com')).not.toHaveProperty('X-Robots-Tag');
    expect(headersFor(rules, '/', 'a.b.workers.dev.evil.com')).not.toHaveProperty('X-Robots-Tag');
    expect(headersFor(rules, '/', 'a.bworkers.dev')).not.toHaveProperty('X-Robots-Tag');
    expect(headersFor(rules, '/', 'workers.dev')).not.toHaveProperty('X-Robots-Tag');
  });

  it('also keeps the path of the pattern', () => {
    expect(headersFor(rules, '/docs/a', 'only.example.dev')).toHaveProperty('X-Docs', '1');
    expect(headersFor(rules, '/other', 'only.example.dev')).not.toHaveProperty('X-Docs');
  });
});

describe('the test server', () => {
  let folder: string;
  let base: string;
  const server = () => createStaticServer({ root: join(folder, 'site'), headersText: '/*\n  X-Test: yes' });
  let running: ReturnType<typeof server>;

  beforeAll(async () => {
    folder = mkdtempSync(join(tmpdir(), 'test-server-'));
    mkdirSync(join(folder, 'site', 'about'), { recursive: true });
    writeFileSync(join(folder, 'site', 'index.html'), '<h1>home</h1>');
    writeFileSync(join(folder, 'site', 'about', 'index.html'), '<h1>about</h1>');
    writeFileSync(join(folder, 'site', '404.html'), '<h1>missing</h1>');
    writeFileSync(join(folder, 'secret.txt'), 'outside the build folder');
    running = server();
    await new Promise<void>((done) => running.listen(0, '127.0.0.1', done));
    base = `http://127.0.0.1:${(running.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((done) => running.close(done));
    rmSync(folder, { recursive: true, force: true });
  });

  it('serves a page and a folder index, with the headers file applied', async () => {
    const home = await fetch(`${base}/`);
    expect(await home.text()).toBe('<h1>home</h1>');
    expect(home.headers.get('x-test')).toBe('yes');
    expect(home.headers.get('content-type')).toMatch(/text\/html/);
    expect(await (await fetch(`${base}/about/`)).text()).toBe('<h1>about</h1>');
  });

  it('answers 404 with the 404 page for a missing file', async () => {
    const missing = await fetch(`${base}/nope`);
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe('<h1>missing</h1>');
  });

  it('never reads outside the build folder (path traversal)', async () => {
    const attempts = [
      '/../secret.txt',
      '/%2e%2e/secret.txt',
      '/..%2fsecret.txt',
      '/..%5Csecret.txt',
      '/about/../../secret.txt',
    ];
    for (const path of attempts) {
      const response = await fetch(`${base}${path}`);
      expect(await response.text()).not.toContain('outside the build folder');
    }
  });

  it('refuses anything but GET and HEAD, and a malformed escape', async () => {
    expect((await fetch(`${base}/`, { method: 'POST', body: 'x' })).status).toBe(405);
    expect((await fetch(`${base}/%E0%A4%A`)).status).toBe(400);
  });

  it('passes the Host of the request to the header rules: a preview host gets noindex, the test host does not', async () => {
    const withRule = createStaticServer({
      root: join(folder, 'site'),
      headersText: '/*\n  X-Test: yes\nhttps://:a.:b.workers.dev/*\n  X-Robots-Tag: noindex',
    });
    await new Promise<void>((done) => withRule.listen(0, '127.0.0.1', done));
    const port = (withRule.address() as AddressInfo).port;
    /** Asks the server for the home page, saying which host the request is for. */
    const ask = (host: string) =>
      new Promise<IncomingMessage>((resolve, reject) => {
        request({ host: '127.0.0.1', port, path: '/', headers: { host } }, resolve).on('error', reject).end();
      });
    try {
      expect((await ask('moses.acct.workers.dev')).headers['x-robots-tag']).toBe('noindex');
      expect((await ask(`127.0.0.1:${port}`)).headers['x-robots-tag']).toBeUndefined();
      expect((await ask('www.mosesluxuryapartments.com')).headers['x-robots-tag']).toBeUndefined();
    } finally {
      await new Promise((done) => withRule.close(done));
    }
  });
});
