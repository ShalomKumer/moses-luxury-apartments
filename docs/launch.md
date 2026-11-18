# Launch runbook

How the site goes live, step by step: who does what, how each step is checked, and how to go back. Written 2026-11-16 (stage 7, `chore/launch-prep`).
**Nothing here has been run against a real account yet**: the steps follow the host's documentation (checked with context7 on 2026-11-16), and the
section "What this guide could not test" lists what the first deployment must confirm.

## Who does what

- **The user** buys the domain and sets up the host account, with Claude guiding each step (Claude cannot register a domain, open an account,
  accept terms or enter payment details). **The client pays** for everything that costs money; Claude states the amount before each purchase.
- **Accounts and the domain belong to the client's business.** Register the domain with the client's details, or make sure it can be
  transferred to him (row E2-E4, `docs/roadmap.md` "Before launch"). Two-step verification on every account, the client's email as recovery.
- **Claude** prepares the code, the checks and this runbook, and runs `npm run launch:live` with the user at each stage.

## Before pressing go

- `npm run launch:check` is green (the owner's business details, the photographers' names, the lawyer's texts, the accessibility coordinator, the
  check-in and check-out times). It is red until they arrive. The runbook's rule was not to connect the domain while it is red; **the user overrode it on 2026-11-17** (see "Launch decision"), so the site goes public with
  placeholders and drafts, and this list is what is left.
- The screen-reader pass (`docs/screen-reader-check.md`) is done and its findings are fixed.
- The release PR from `dev` to `main` is merged by the user. Production is the `main` branch; every other branch is a preview.
- Improvements still wanted are merged into `dev` first. After the launch they go the same way: `dev`, a PR, a release PR to `main`.

## Launch decision (2026-11-17)

The runbook said: do not connect the domain while `npm run launch:check` is red. **The user decided to launch now, open to search engines, as the site is**, so that the client sees it on the
real address and corrects it there (the owner's details and texts, the lawyer's texts, the photographers, the screen-reader pass, the improvements list and `feature/directions` all follow the launch).
Claude stated what a visitor and a search engine will see, and the user chose to go on. What is live, and not yet right:

- the business details are dashed boxes that start with "To fill:" (the legal name, the business number, the address, one more point on the home page), in Hebrew and English;
- the privacy policy, the terms, the cancellation policy and the accessibility statement are marked as drafts, with their own places to fill (L1, L2, L11 stay open);
- most photos have no confirmed creator (C3): a photo whose rights holder objects is taken down at once, and the owner is asked in `docs/owner-requests.md`;
- the screen-reader pass (A5) is not done, and `feature/directions` (E5, structured data) is not built.

Each of these is a row in `docs/compliance.md` that stays open and is scheduled in `docs/roadmap.md`. `launch:check` stays red and is **not** part of `verify`, so nothing breaks; it is the list of what is left.

## Steps

### 1. Register the domain

`mosesluxuryapartments.com`, with the client's details, auto-renewal on, two-step verification on the account, the registrar's privacy for the
contact details on. Registering it in the same Cloudflare account that hosts the site (Cloudflare Registrar, sold at cost) keeps the DNS in one place;
any other registrar works if its name servers are pointed at Cloudflare (step 3).
If the name cannot be had, change the one line in `src/config/site-url.ts` and rebuild: every canonical link, `hreflang`, sitemap and robots address follows it.

### 2. The host account

A Cloudflare account on the client's email, two-step verification on, the user added as an administrator. The site is deployed as a **Worker with static
assets** (the Astro adapter builds for Workers, `docs/architecture.md`).

### 3. First deployment, with no domain yet

```bash
npm run verify
npx astro build
npx wrangler deploy
```

`wrangler deploy` asks the user to log in (a browser window; Claude never sees the login). It prints an address like `ahuzot-moses.<account>.workers.dev`.
That address is a **preview address**: check that it is closed to search engines.

```bash
curl -sI https://ahuzot-moses.<account>.workers.dev/ | grep -i x-robots-tag
```

It must print `x-robots-tag: noindex` (the rule at the end of `public/_headers`; the test `tests/policy/headers.test.ts` pins how it is written, it cannot prove the host honours it). An alternative to the
manual deploy is Workers Builds (a git connection, build command `npx astro build`, deploy command `npx wrangler deploy`, production branch `main`).

**Before step 4, deploy production from `main`.** The first deployment above was built from `dev` and is only a preview. Once the user has merged the release PR (`dev` into `main`), run
`git checkout main && git pull --ff-only`, then `npm run verify`, `npx astro build` and `npx wrangler deploy` again, so the version the domain serves is `main`.

### 4. Connect the domain

In the Cloudflare dashboard: the Worker, Settings, Domains and routes, Add, **Custom domain**: `www.mosesluxuryapartments.com`. Cloudflare creates the
DNS record and the certificate. Wait until the status says active.

### 5. Send the bare domain to `www`

1. DNS: a **proxied** record for the bare domain (an `A` record `192.0.2.1`, proxied, is the usual placeholder: it only has to exist so the request reaches Cloudflare).
2. Rules, Redirect Rules, a custom rule: when the URL matches the wildcard `https://mosesluxuryapartments.com/*`, redirect to
   `https://www.mosesluxuryapartments.com/${1}`, status **301**, preserve the query string.

### 6. HTTPS

SSL/TLS: encryption mode **Full (strict)**; Edge Certificates: **Always Use HTTPS** on and the minimum TLS version 1.2. **HSTS comes from the site's own
`_headers` file** (`max-age=31536000; includeSubDomains`): do not also switch on the dashboard's HSTS, it would send the header twice.

### 7. Check it

```bash
npm run launch:live -- --preview https://ahuzot-moses.<account>.workers.dev
```

It asks the live site (and the preview address, when given) and prints `ok` or `FAIL` for each check: HTTP goes to HTTPS with a permanent redirect, the bare
domain goes to `www` keeping the path and the query, the home page answers with exactly the headers of `public/_headers` and no `noindex`,
`robots.txt` names the sitemap on a `Sitemap:` line and does not shut out every crawler, the sitemap lists the home page, and the preview address answers 200 and is `noindex`.
A relative `Location` is read against the address that was asked, as a browser does. Every line must be `ok`. It proves only these checks: it is not a security audit,
and the HTTPS settings of the dashboard (the mode, the minimum TLS version) are not among them.

**Also by hand, once the domain answers:** a proxied zone can add things to a page that the build never had. Compare the live home page with the preview address: search the body for
`cdn-cgi`, `email-protection`, `cloudflareinsights` and `rocket-loader`, and look at the response headers for a `Set-Cookie` (for example `__cf_bm`). Email Address Obfuscation or a similar
setting could rewrite the booking links or add a script or a cookie (iron rules 2 and 6); whatever shows up is switched off in the dashboard, and the date is written here. If `live-indexable`
fails in `launch:live`, the `noindex` rule reached the live domain and the site is invisible to Google: stop and fix `public/_headers`.

### 8. Search Console

Add the domain as a property (a DNS `TXT` record verifies it), then submit `https://www.mosesluxuryapartments.com/sitemap.xml` (E4). Do it after step 7, not before.

## Going back

- **A bad deployment:** `npx wrangler rollback` (or the dashboard: the Worker, Deployments, the previous version, Rollback). It activates the previous version on
  every route at once. Then fix on a branch.
- **The domain must come down:** remove the custom domain from the Worker; the preview address stays up and stays `noindex`.
- Try the rollback once before the launch, on the preview address (S18).

## The first deployment (2026-11-17)

Done by the user with Claude, to the host's preview address only; the domain is **not** connected.

- Worker `ahuzot-moses`, preview address `https://ahuzot-moses.ahuzot-moses.workers.dev` (the account's `workers.dev` name is `ahuzot-moses`). Built from `dev` after `npm run verify`
  (every step green; one browser test stalled once at the end of a run and passed alone; `audit:prod` was red for an advisory with no fix, since handled by the reviewed list, S14).
- `npx wrangler deploy` uploaded 456 files in about three minutes; later deployments upload only what changed.
- A new `workers.dev` name may not resolve on the local DNS resolver for a while. Ask a public resolver for the address (`nslookup <host> 1.1.1.1`) and pin it
  (`curl --resolve <host>:443:<ip> https://<host>/`) until it does; `npm run launch:live` uses the local resolver and fails with `ENOTFOUND` or a timeout until then.

### Accounts and ownership (decide before launch)

- The Cloudflare account is **the user's own**; the domain `mosesluxuryapartments.com` was bought there (2026-11-17, USD 11.17 a year, renewing at the same price,
  auto-renewal on) with **the client as registrant**: the registrant's email must confirm the registration (the client did so on 2026-11-17), or the registrar may suspend the domain.
- So the user controls DNS, the Worker and the renewal payment, and the client is the registrant of record. Before the launch, decide with the client: move the account to the
  client, or add him as an administrator of this one. The runbook's first rule (accounts belong to the client's business) is **not yet met**; note the decision here.

## Dashboard settings log

Settings that live in the Cloudflare dashboard and not in git. One line per change, with its date; add to it whenever one changes.

**2026-11-17, the go-live** (done by the user in the dashboard, with Claude):

- Production deployed from `main` (`04d1466`, release PR #54): Worker version `774ea829`, after `npm run verify` was green on `main`.
- Workers and Pages, `ahuzot-moses`, Domains: custom domain **`www.mosesluxuryapartments.com`** added for Production (status Active). The `workers.dev` addresses stay on and stay `noindex`.
- DNS: an `A` record for `@` (`192.0.2.1`, Proxied; a placeholder address that only has to exist so that a request reaches Cloudflare); `www` is the Worker's own record.
- Redirect Rules, rule **`bare to www`**: Request URL `https://mosesluxuryapartments.com/*`, Target URL `https://www.mosesluxuryapartments.com/${1}`, status 301, **Preserve query string** on.
- SSL/TLS: encryption mode **Full (strict)**; Edge Certificates: **Always Use HTTPS** on, **Minimum TLS Version 1.2**; **HSTS left off** in the dashboard (the site sends it from `public/_headers`; a second one would be sent twice).

**Checked the same day:** `npm run launch:live -- --preview https://ahuzot-moses.ahuzot-moses.workers.dev` passed 11 checks (HTTP to HTTPS 301, the home page, every header of `public/_headers`, `live-indexable`, `robots.txt`, the sitemap). Two checks failed
only because the local DNS resolver did not yet know the new names (`bare-to-www`: ENOTFOUND; `preview-noindex`: timeout); both were checked by hand with `curl --resolve` against an address from `nslookup <host> 1.1.1.1`:
the bare domain answers 301 to `www` and keeps the path and the query string (`/cabins/x?b=2&c=3`), and the preview address answers `x-robots-tag: noindex`. The live home page carries no `cdn-cgi`, `email-protection`,
`cloudflareinsights` or `rocket-loader`, and no `Set-Cookie`. `http://` on the bare domain makes two hops (HTTPS on the bare domain, then `www`); both are 301.

**2026-11-18:**

- **Search Console (step 8):** a *Domain* property for `mosesluxuryapartments.com` (it covers `www`, the bare domain, `http` and `https`), verified with the DNS `TXT` record `google-site-verification=...`
  (**keep that record**: removing it loses the verification). The sitemap `https://www.mosesluxuryapartments.com/sitemap.xml` was submitted, in its full form (a Domain property refuses a bare `sitemap.xml`), and Search Console shows it as successful.
- **Web Analytics switched off.** Cloudflare was injecting its Web Analytics script (`static.cloudflareinsights.com/beacon.min.js`) into every page of the zone, in the browser's page but not in the HTML a plain `curl` or `fetch` returns, so the by-hand check of step 7 has to be done in a
  browser. Our content security policy blocked it (a console error on every load, and nothing was sent), but a third-party script on the site touches iron rules 2 and 6. Set in the dashboard under Observability, Analytics, **Web analytics**, **Manage site** for `mosesluxuryapartments.com`:
  Real User Measurements (RUM) from "Enable, excluding visitor data in the EU" to **Disable**. Checked afterwards in a browser: the script is gone from `/`, `/en/` and `/en/cabins/artist-estate/`, and no new policy error appears.

**Not done yet:** the `wrangler rollback` trial (S18), the screen-reader pass (A5), and the decision on whose Cloudflare account this is.

## What this guide could not test

What the first deployment settled, and what it did not:

1. **The `noindex` rule for the preview addresses: confirmed 2026-11-17.** The home page, `/en/` and the 404 page of the preview address answer `x-robots-tag: noindex`; the home page also
   sends the headers of `public/_headers` (HSTS, the content security policy, `x-frame-options`, the referrer and permissions policies), and `robots.txt` answers. The pattern is
   `https://:version.:subdomain.workers.dev/*` (placeholders, each one label of the address; a pattern may hold only one `*`). There is no rule for `pages.dev`: the site is not deployed to Pages.
2. **The generated Worker config: checked.** The build writes `dist/client/wrangler.json` with the name `ahuzot-moses` and a `SESSION` KV binding that the adapter adds by default and
   the site never uses. `wrangler deploy` printed the binding but `wrangler kv namespace list` shows **no namespace**: nothing was created and nothing is charged. The unused binding stays.
3. **The preview addresses of other branches** (version and preview URLs under `workers.dev`) are covered by the same rule but **not tested**: only the one Worker version was deployed. Confirm with one `curl` the first time a version address is opened.
4. **Redirect rules and HTTPS settings** are dashboard settings, not code: they are not in git, and `launch:live` is what checks them. **Done on 2026-11-17** (see "Dashboard settings log"); write down the date of each later change there.

Iron rules: S2 (HTTPS and HSTS), S18 (environments, rollback), E3 and E4 (canonical address, sitemap, robots).
