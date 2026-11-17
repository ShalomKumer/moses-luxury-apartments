import { getCollection } from 'astro:content';

/**
 * Lists the address of every public page without a language: the home page, one page for each apartment file and one for each
 * Hebrew legal file (the English files are the same pages in the other language). The 404 page is not listed: it is not a page
 * to find. These are the same lists the page routes build from, so a new apartment or text is in the sitemap at once.
 */
export async function listSitePaths(): Promise<string[]> {
  const cabins = await getCollection('cabins');
  const legal = (await getCollection('legal')).filter((page) => page.id.startsWith('he/'));
  return ['/', ...cabins.map((cabin) => `/cabins/${cabin.id}`), ...legal.map((page) => `/${page.id.split('/')[1]}`)];
}
