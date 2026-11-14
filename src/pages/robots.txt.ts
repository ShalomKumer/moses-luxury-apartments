/** `/robots.txt`: every page may be indexed, and the sitemap is named with its absolute address (E4, E6). */
import type { APIRoute } from 'astro';
import { createRobots } from '@components/seo/seo-documents';

export const GET: APIRoute = () =>
  new Response(createRobots(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
