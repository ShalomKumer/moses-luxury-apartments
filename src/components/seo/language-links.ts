import { absoluteUrl } from '@domain/seo/absolute-url';
import type { SitemapAlternate } from '@domain/seo/sitemap-xml';
import { SITE_URL } from '@config/site-url';
import { alternatesOf } from '@i18n/paths';

/**
 * The `hreflang` alternates of a page, as absolute addresses (E3): the same page in every language, and `x-default`, the
 * language a visitor with neither gets (Hebrew, the first). The page's head and the sitemap both use this one list, so they can
 * never disagree.
 * @param path the page's own address without a language ("/", "/cabins/tarpat-18", "/privacy")
 */
export function languageLinks(path: string): SitemapAlternate[] {
  const alternates = alternatesOf(path);
  return [
    ...alternates.map((alternate) => ({ hreflang: alternate.locale, url: absoluteUrl(SITE_URL, alternate.href) })),
    { hreflang: 'x-default', url: absoluteUrl(SITE_URL, alternates[0].href) },
  ];
}
