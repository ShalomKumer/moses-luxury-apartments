/**
 * Makes the absolute address of a page: the site's address and the page's path ("/", "/en/", "/cabins/tarpat-18"). A canonical
 * link, an `hreflang` alternate, an Open Graph address and a sitemap entry must all be absolute (E2 to E4). Only the site's
 * origin is used (a path in the site address is ignored), a query or a fragment of the path is dropped, and a run of slashes at
 * the start becomes one, so a path can never change the host.
 * @param site the site's address, "https://host" (http or https only)
 * @param path the page's path, with or without the first slash
 * @throws when the site address is not an http or https address
 */
export function absoluteUrl(site: string, path: string): string {
  let base: URL;
  try {
    base = new URL(site);
  } catch {
    throw new Error(`The site address is not a web address: "${site}"`);
  }
  if (base.protocol !== 'https:' && base.protocol !== 'http:') {
    throw new Error(`The site address must be http or https: "${site}"`);
  }
  const clean = (path.split(/[?#]/)[0] ?? '').replace(/^\/+/, '');
  return `${base.origin}/${clean}`;
}
