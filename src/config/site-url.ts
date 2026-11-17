/**
 * The address of the live site, the one place it is written: `astro.config.mjs` reads it for `site`, and every canonical link,
 * `hreflang` alternate, Open Graph address, the sitemap and `robots.txt` are built from it (E2 to E4).
 *
 * The domain the user chose (2026-11-15) is written with `www`, so `www` is the canonical host. At launch the host must send
 * the bare domain (mosesluxuryapartments.com) to this address with a permanent redirect, and the domain must be registered
 * in the owner's own name (stage 7). To change it, change this one line ("https://host", no trailing slash) and rebuild.
 */
export const SITE_URL = 'https://www.mosesluxuryapartments.com';
