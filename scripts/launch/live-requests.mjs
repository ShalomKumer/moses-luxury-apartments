// The addresses `check-live.mjs` asks, each named after the answer `live-checks.mjs` reads by that name: pure, so that a swapped address is a failing test.
import { BARE_PROBE_PATH, bareHost } from './live-checks.mjs';

/**
 * @param {string} siteUrl the live address ("https://www.host")
 * @param {string} [previewUrl] a preview address of the host
 * @returns {{ name: string, url: string, body?: boolean }[]} the requests; `body` is true when the text of the answer is read
 */
export function requestsFor(siteUrl, previewUrl) {
  const { host } = new URL(siteUrl);
  const bare = bareHost(siteUrl);
  return [
    { name: 'http', url: `http://${host}/` },
    ...(bare ? [{ name: 'bare', url: `https://${bare}${BARE_PROBE_PATH}` }] : []),
    { name: 'home', url: `${siteUrl}/`, body: true },
    { name: 'robots', url: `${siteUrl}/robots.txt`, body: true },
    { name: 'sitemap', url: `${siteUrl}/sitemap.xml`, body: true },
    ...(previewUrl ? [{ name: 'preview', url: `${previewUrl}/` }] : []),
  ];
}
