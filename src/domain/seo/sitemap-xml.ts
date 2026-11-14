/** An `hreflang` alternate of a page: the same page in another language (or the default one). */
export interface SitemapAlternate {
  hreflang: string;
  url: string;
}

/** One address of the sitemap, with every language version of the same page. */
export interface SitemapUrl {
  url: string;
  alternates: SitemapAlternate[];
}

/** Escapes the five characters that are special in XML, so an address can never break out of its element or attribute. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds `sitemap.xml` (E4): every page address, each with its language alternates. It states no last-modified date, priority
 * or change frequency, because the site has no honest source for them (H1).
 * @param urls the pages, one entry for each language version
 */
export function buildSitemapXml(urls: readonly SitemapUrl[]): string {
  const entries = urls.map(({ url, alternates }) => {
    const links = alternates.map(
      (alternate) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.url)}"/>`,
    );
    return ['  <url>', `    <loc>${escapeXml(url)}</loc>`, ...links, '  </url>'].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}
