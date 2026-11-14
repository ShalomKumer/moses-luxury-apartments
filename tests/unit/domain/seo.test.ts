import { describe, expect, it } from 'vitest';
import { absoluteUrl } from '@domain/seo/absolute-url';
import { buildRobotsTxt } from '@domain/seo/robots-txt';
import { buildShareTags, type ShareInput } from '@domain/seo/share-meta';
import { buildSitemapXml, type SitemapUrl } from '@domain/seo/sitemap-xml';

const SITE = 'https://example.test';

describe('absoluteUrl', () => {
  it('joins a path to the site address', () => {
    expect(absoluteUrl(SITE, '/privacy')).toBe('https://example.test/privacy');
    expect(absoluteUrl(SITE, '/en/cabins/tarpat-18')).toBe('https://example.test/en/cabins/tarpat-18');
  });

  it('keeps the root and the English root as they are', () => {
    expect(absoluteUrl(SITE, '/')).toBe('https://example.test/');
    expect(absoluteUrl(SITE, '/en/')).toBe('https://example.test/en/');
  });

  it('accepts a site address with a trailing slash and a path with none', () => {
    expect(absoluteUrl('https://example.test/', 'privacy')).toBe('https://example.test/privacy');
  });

  it('never doubles a slash and drops a query or fragment of the path', () => {
    expect(absoluteUrl(SITE, '//privacy')).toBe('https://example.test/privacy');
    expect(absoluteUrl(SITE, '/privacy?x=1#top')).toBe('https://example.test/privacy');
  });

  it('refuses a site address that is not http or https', () => {
    expect(() => absoluteUrl('javascript:alert(1)', '/')).toThrow();
    expect(() => absoluteUrl('example.test', '/')).toThrow();
    expect(() => absoluteUrl('', '/')).toThrow();
  });
});

describe('buildShareTags', () => {
  const input: ShareInput = {
    locale: 'he',
    siteName: 'דירת מוזס',
    title: 'אצולת הכיכר א׳ | דירת מוזס',
    description: 'דירת אירוח בצפת',
    url: 'https://example.test/cabins/atzulat-hakikar-a',
    image: { url: 'https://example.test/brand/share.jpg', width: 1200, height: 630, alt: 'דירת מוזס' },
  };
  const find = (tags: ReturnType<typeof buildShareTags>, key: string) => tags.filter((tag) => tag.key === key);

  it('writes the Open Graph tags of the page', () => {
    const tags = buildShareTags(input);
    expect(find(tags, 'og:type')[0].content).toBe('website');
    expect(find(tags, 'og:site_name')[0].content).toBe('דירת מוזס');
    expect(find(tags, 'og:title')[0].content).toBe(input.title);
    expect(find(tags, 'og:description')[0].content).toBe(input.description);
    expect(find(tags, 'og:url')[0].content).toBe(input.url);
    expect(find(tags, 'og:image')[0].content).toBe('https://example.test/brand/share.jpg');
    expect(find(tags, 'og:image:width')[0].content).toBe('1200');
    expect(find(tags, 'og:image:height')[0].content).toBe('630');
    expect(find(tags, 'og:image:alt')[0].content).toBe('דירת מוזס');
  });

  it('names the language of the page and offers the other one', () => {
    expect(find(buildShareTags(input), 'og:locale')[0].content).toBe('he_IL');
    expect(find(buildShareTags(input), 'og:locale:alternate')[0].content).toBe('en_US');
    const english = buildShareTags({ ...input, locale: 'en' });
    expect(find(english, 'og:locale')[0].content).toBe('en_US');
    expect(find(english, 'og:locale:alternate')[0].content).toBe('he_IL');
  });

  it('writes a large-image Twitter card with the same title, description and image', () => {
    const tags = buildShareTags(input);
    expect(find(tags, 'twitter:card')[0].content).toBe('summary_large_image');
    expect(find(tags, 'twitter:title')[0].content).toBe(input.title);
    expect(find(tags, 'twitter:description')[0].content).toBe(input.description);
    expect(find(tags, 'twitter:image')[0].content).toBe(input.image.url);
    expect(find(tags, 'twitter:image:alt')[0].content).toBe(input.image.alt);
  });

  it('uses the right attribute for each tag: property for Open Graph, name for Twitter', () => {
    const tags = buildShareTags(input);
    expect(tags.filter((tag) => tag.key.startsWith('og:')).every((tag) => tag.attribute === 'property')).toBe(true);
    expect(tags.filter((tag) => tag.key.startsWith('twitter:')).every((tag) => tag.attribute === 'name')).toBe(true);
  });

  it('claims nothing it cannot back: no rating, price, review or availability tag', () => {
    const keys = buildShareTags(input).map((tag) => tag.key);
    expect(keys.filter((key) => /rating|price|review|availability|product/i.test(key))).toEqual([]);
  });
});

describe('buildSitemapXml', () => {
  const pages: SitemapUrl[] = [
    {
      url: 'https://example.test/',
      alternates: [
        { hreflang: 'he', url: 'https://example.test/' },
        { hreflang: 'en', url: 'https://example.test/en/' },
        { hreflang: 'x-default', url: 'https://example.test/' },
      ],
    },
    {
      url: 'https://example.test/en/',
      alternates: [
        { hreflang: 'he', url: 'https://example.test/' },
        { hreflang: 'en', url: 'https://example.test/en/' },
        { hreflang: 'x-default', url: 'https://example.test/' },
      ],
    },
  ];

  it('writes one url entry per page with its language alternates', () => {
    const xml = buildSitemapXml(pages);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).toContain('<loc>https://example.test/en/</loc>');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.test/"/>');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://example.test/en/"/>');
  });

  it('claims no last-modified date, priority or change frequency it cannot back', () => {
    const xml = buildSitemapXml(pages);
    expect(xml).not.toMatch(/<lastmod>|<priority>|<changefreq>/);
  });

  it('escapes every character that is special in XML', () => {
    const xml = buildSitemapXml([{ url: 'https://example.test/a?b=1&c=<2>"3"', alternates: [] }]);
    expect(xml).toContain('<loc>https://example.test/a?b=1&amp;c=&lt;2&gt;&quot;3&quot;</loc>');
    expect(xml).not.toContain('&c=');
  });

  it('writes a valid empty set for no pages', () => {
    const xml = buildSitemapXml([]);
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });
});

describe('buildRobotsTxt', () => {
  it('allows every page and names the sitemap with an absolute address', () => {
    const text = buildRobotsTxt('https://example.test/sitemap.xml');
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://example.test/sitemap.xml');
    expect(text.endsWith('\n')).toBe(true);
  });

  it('does not disallow a page: every page is public (E6)', () => {
    expect(buildRobotsTxt('https://example.test/sitemap.xml')).not.toMatch(/Disallow:\s*\S/);
  });
});
