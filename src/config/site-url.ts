/**
 * The address of the live site, the one place it is written: `astro.config.mjs` reads it for `site`, and every canonical link,
 * `hreflang` alternate, Open Graph address, the sitemap and `robots.txt` are built from it (E2 to E4).
 *
 * It is a placeholder until the owner has a domain: `.invalid` is reserved and can never resolve, so a shared link or a search
 * engine can never land on a real site by mistake, and `npm run launch:check` fails while it is left. At launch, change this
 * one line to the real address ("https://host", no trailing slash) and rebuild.
 */
export const SITE_URL = 'https://domain-to-fill.invalid';
