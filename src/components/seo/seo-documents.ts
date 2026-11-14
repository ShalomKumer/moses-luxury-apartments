import { absoluteUrl } from '@domain/seo/absolute-url';
import { buildRobotsTxt } from '@domain/seo/robots-txt';
import { buildSitemapXml } from '@domain/seo/sitemap-xml';
import { SITE_URL } from '@config/site-url';
import { alternatesOf } from '@i18n/paths';
import { languageLinks } from './language-links';
import { listSitePaths } from './site-pages';

/** Makes `sitemap.xml`: every page in every language, each entry with its language alternates (E4). */
export async function createSitemap(): Promise<string> {
  const paths = await listSitePaths();
  const urls = paths.flatMap((path) => {
    const alternates = languageLinks(path);
    return alternatesOf(path).map((alternate) => ({ url: absoluteUrl(SITE_URL, alternate.href), alternates }));
  });
  return buildSitemapXml(urls);
}

/** Makes `robots.txt`: everything may be indexed, and the sitemap is named (E4, E6). */
export function createRobots(): string {
  return buildRobotsTxt(absoluteUrl(SITE_URL, '/sitemap.xml'));
}
