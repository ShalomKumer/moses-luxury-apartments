/**
 * Builds `robots.txt` (E4, E6): every page is public and may be indexed, and the sitemap is named with its absolute address.
 * There is no private or signed-in page, so nothing is disallowed; a page that must stay out of a search engine says so with
 * its own `noindex` (the 404 page does).
 * @param sitemapUrl the absolute address of `sitemap.xml`
 */
export function buildRobotsTxt(sitemapUrl: string): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapUrl}`, ''].join('\n');
}
