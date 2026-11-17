import { describe, expect, it } from 'vitest';
import { checkLive, bareHost } from '../../../scripts/launch/live-checks.mjs';

const SITE = 'https://www.example.com';
const HEADERS_TEXT = [
  '/*',
  '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
  "  Content-Security-Policy: default-src 'self'",
  '  X-Content-Type-Options: nosniff',
  'https://*.workers.dev/*',
  '  X-Robots-Tag: noindex',
].join('\n');

type Answer = { status?: number; headers?: Record<string, string>; body?: string; error?: string };

/** The answers of a site that is set up correctly. */
function goodAnswers(): Record<string, Answer> {
  return {
    http: { status: 301, headers: { location: `${SITE}/` } },
    bare: { status: 301, headers: { location: `${SITE}/en/?a=1` } },
    home: {
      status: 200,
      headers: {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'content-security-policy': "default-src 'self'",
        'x-content-type-options': 'nosniff',
      },
      body: '<html><head><title>Home</title></head></html>',
    },
    robots: { status: 200, body: `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n` },
    sitemap: { status: 200, body: `<urlset><url><loc>${SITE}/</loc></url></urlset>` },
  };
}

const run = (answers: Record<string, Answer>, previewUrl?: string) =>
  checkLive({ siteUrl: SITE, headersText: HEADERS_TEXT, answers, previewUrl });
const failed = (answers: Record<string, Answer>, previewUrl?: string) =>
  run(answers, previewUrl)
    .filter((finding) => !finding.ok)
    .map((finding) => finding.check);

describe('bareHost', () => {
  it('drops the www of the live address', () => {
    expect(bareHost('https://www.example.com')).toBe('example.com');
  });

  it('is null for an address without www, so there is no bare domain to redirect', () => {
    expect(bareHost('https://example.com')).toBeNull();
  });
});

describe('checkLive', () => {
  it('passes a site that is set up correctly', () => {
    expect(failed(goodAnswers())).toEqual([]);
  });

  it('fails an HTTP address that is not sent to the HTTPS address with a permanent redirect', () => {
    const temporary = goodAnswers();
    temporary.http = { status: 302, headers: { location: `${SITE}/` } };
    expect(failed(temporary)).toEqual(['http-to-https']);
    const answersPlainPage = goodAnswers();
    answersPlainPage.http = { status: 200, headers: {} };
    expect(failed(answersPlainPage)).toEqual(['http-to-https']);
  });

  it('fails a bare domain that does not reach www with the same path and query', () => {
    const wrongPlace = goodAnswers();
    wrongPlace.bare = { status: 301, headers: { location: `${SITE}/` } };
    expect(failed(wrongPlace)).toEqual(['bare-to-www']);
    const temporary = goodAnswers();
    temporary.bare = { status: 302, headers: { location: `${SITE}/en/?a=1` } };
    expect(failed(temporary)).toEqual(['bare-to-www']);
  });

  it('fails a header that is missing or differs from the headers file, naming it', () => {
    const answers = goodAnswers();
    delete answers.home.headers!['strict-transport-security'];
    answers.home.headers!['content-security-policy'] = 'default-src *';
    const findings = run(answers).filter((finding) => !finding.ok);
    expect(findings.map((finding) => finding.check)).toEqual(['header', 'header']);
    expect(findings[0].detail).toContain('strict-transport-security');
    expect(findings[1].detail).toContain('content-security-policy');
  });

  it('does not ask the live domain for the preview rule', () => {
    const answers = goodAnswers();
    answers.home.headers!['x-robots-tag'] = 'noindex';
    expect(failed(answers)).toEqual(['live-indexable']);
  });

  it('fails a home page that does not answer 200', () => {
    const answers = goodAnswers();
    answers.home = { status: 522, headers: {} };
    expect(failed(answers)).toContain('home');
  });

  it('fails a robots.txt without the sitemap line, and a sitemap that does not list the home page', () => {
    const answers = goodAnswers();
    answers.robots = { status: 200, body: 'User-agent: *\nAllow: /\n' };
    answers.sitemap = { status: 200, body: '<urlset></urlset>' };
    expect(failed(answers)).toEqual(['robots', 'sitemap']);
  });

  it('reports a request that got no answer, instead of crashing', () => {
    const answers = goodAnswers();
    answers.bare = { error: 'timeout after 10 s' };
    const findings = run(answers).filter((finding) => !finding.ok);
    expect(findings.map((finding) => finding.check)).toEqual(['bare-to-www']);
    expect(findings[0].detail).toContain('timeout after 10 s');
  });

  it('reports every check that has no answer at all', () => {
    expect(failed({})).toEqual(['http-to-https', 'bare-to-www', 'home', 'robots', 'sitemap']);
  });

  it('checks a preview address for noindex only when one is given', () => {
    expect(failed(goodAnswers(), 'https://moses.workers.dev')).toEqual(['preview-noindex']);
    const answers = goodAnswers();
    answers.preview = { status: 200, headers: { 'x-robots-tag': 'noindex' } };
    expect(failed(answers, 'https://moses.workers.dev')).toEqual([]);
    const indexable = goodAnswers();
    indexable.preview = { status: 200, headers: {} };
    expect(failed(indexable, 'https://moses.workers.dev')).toEqual(['preview-noindex']);
  });

  it('skips the bare-domain check when the live address has no www', () => {
    const answers = goodAnswers();
    delete answers.bare;
    const findings = checkLive({
      siteUrl: 'https://example.com',
      headersText: HEADERS_TEXT,
      answers: {
        ...answers,
        http: { status: 301, headers: { location: 'https://example.com/' } },
        robots: { status: 200, body: 'Sitemap: https://example.com/sitemap.xml' },
        sitemap: { status: 200, body: '<loc>https://example.com/</loc>' },
      },
    });
    expect(findings.filter((finding) => !finding.ok)).toEqual([]);
    expect(findings.map((finding) => finding.check)).not.toContain('bare-to-www');
  });

  it('accepts a permanent 308 as well as a 301', () => {
    const answers = goodAnswers();
    answers.http = { status: 308, headers: { location: `${SITE}/` } };
    answers.bare = { status: 308, headers: { location: `${SITE}/en/?a=1` } };
    expect(failed(answers)).toEqual([]);
  });

  it('resolves a relative Location against the address that was asked, not the expected one', () => {
    const loop = goodAnswers();
    loop.http = { status: 301, headers: { location: '/' } };
    expect(failed(loop)).toEqual(['http-to-https']);
    const stays = goodAnswers();
    stays.bare = { status: 301, headers: { location: '/en/?a=1' } };
    expect(failed(stays)).toEqual(['bare-to-www']);
    const schemeRelative = goodAnswers();
    schemeRelative.bare = { status: 301, headers: { location: '//www.example.com/en/?a=1' } };
    expect(failed(schemeRelative)).toEqual([]);
  });

  it('fails when the headers file gives no header to compare, instead of passing on nothing', () => {
    const findings = checkLive({ siteUrl: SITE, headersText: '', answers: goodAnswers() });
    expect(findings.filter((finding) => !finding.ok).map((finding) => finding.check)).toEqual(['header']);
  });

  it('fails a robots.txt that blocks everyone, or whose sitemap line is only a comment', () => {
    const blocked = goodAnswers();
    blocked.robots = {
      status: 200,
      body: `User-agent: *
Disallow: /
Sitemap: ${SITE}/sitemap.xml
`,
    };
    expect(failed(blocked)).toEqual(['robots']);
    const commented = goodAnswers();
    commented.robots = {
      status: 200,
      body: `User-agent: *
Allow: /
# Sitemap: ${SITE}/sitemap.xml
`,
    };
    expect(failed(commented)).toEqual(['robots']);
  });

  it('lets a robots.txt block a path or another crawler, as long as the site is open to the rest', () => {
    const answers = goodAnswers();
    answers.robots = {
      status: 200,
      body: `User-agent: BadBot
Disallow: /

User-agent: *
Disallow: /private/
Sitemap: ${SITE}/sitemap.xml
`,
    };
    expect(failed(answers)).toEqual([]);
  });

  it('fails a home page that forbids indexing by "none" or by a robots meta tag', () => {
    const none = goodAnswers();
    none.home.headers!['x-robots-tag'] = 'none';
    expect(failed(none)).toEqual(['live-indexable']);
    const meta = goodAnswers();
    meta.home.body = '<head><meta content="noindex, nofollow" name="robots"></head>';
    expect(failed(meta)).toEqual(['live-indexable']);
    const harmless = goodAnswers();
    harmless.home.body = '<head><meta name="robots" content="index, follow"></head>';
    expect(failed(harmless)).toEqual([]);
  });

  it('fails a preview address that answers with an error, even when it says noindex', () => {
    const answers = goodAnswers();
    answers.preview = { status: 404, headers: { 'x-robots-tag': 'noindex' } };
    expect(failed(answers, 'https://moses.workers.dev')).toEqual(['preview-noindex']);
  });
});
