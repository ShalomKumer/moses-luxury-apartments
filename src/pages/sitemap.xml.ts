/** `/sitemap.xml`: every page in both languages, written at build time (E4). */
import type { APIRoute } from 'astro';
import { createSitemap } from '@components/seo/seo-documents';

export const GET: APIRoute = async () =>
  new Response(await createSitemap(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
