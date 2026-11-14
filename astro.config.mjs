// @ts-check
import cloudflare from '@astrojs/cloudflare';
import { defineConfig, passthroughImageService } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { fillMarkersPlugin } from './src/markdown/fill-markers-plugin.ts';
import { pageStructurePlugin } from './src/markdown/page-structure-plugin.ts';
import { SITE_URL } from './src/config/site-url.ts';

export default defineConfig({
  // The live site's address, the one place it is written: canonical links, hreflang, sharing tags, the sitemap and robots.txt are built from it (E2 to E4).
  site: SITE_URL,
  // Every page is built ahead of time; only /api/availability runs on request.
  output: 'static',
  // Photos are prepared before they are added, so no image processing runs at build time or on request.
  adapter: cloudflare({ imageService: 'passthrough' }),
  image: { service: passthroughImageService() },
  // Stylesheets as files, never inline, so the CSP can stay "style-src 'self'" (S10).
  build: { inlineStylesheets: 'never' },
  // A scoped style marks its elements with a short class, not a long data attribute: the same specificity, about 4 KB less
  // on the home page, which is close to its code budget (rule 3).
  scopedStyleStrategy: 'class',
  // No source maps in production (S4); scripts as files, never inline, so the CSP can stay "script-src 'self'".
  vite: { build: { sourcemap: false, assetsInlineLimit: 0 } },
  // Legal pages: a part still to fill becomes a labelled box; section headings and tables become keyboard targets (L11, A3).
  markdown: { processor: satteri({ hastPlugins: [fillMarkersPlugin, pageStructurePlugin] }) },
  // No environment variables today: the site shows no availability (2026-10-31), so no calendar address is read.
  // When the admin view exists, its calendar addresses are declared here as secrets (S13).
});
