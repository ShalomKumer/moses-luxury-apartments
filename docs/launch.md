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
  check-in and check-out times). It is red until they arrive; **do not connect the domain while it is red**, or the site goes public with
  placeholders and drafts.
- The screen-reader pass (`docs/screen-reader-check.md`) is done and its findings are fixed.
- The release PR from `dev` to `main` is merged by the user. Production is the `main` branch; every other branch is a preview.
- Improvements still wanted are merged into `dev` first. After the launch they go the same way: `dev`, a PR, a release PR to `main`.

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

### 8. Search Console

Add the domain as a property (a DNS `TXT` record verifies it), then submit `https://www.mosesluxuryapartments.com/sitemap.xml` (E4). Do it after step 7, not before.

## Going back

- **A bad deployment:** `npx wrangler rollback` (or the dashboard: the Worker, Deployments, the previous version, Rollback). It activates the previous version on
  every route at once. Then fix on a branch.
- **The domain must come down:** remove the custom domain from the Worker; the preview address stays up and stays `noindex`.
- Try the rollback once before the launch, on the preview address (S18).

## What this guide could not test

The first deployment must confirm these, and this file is corrected with what is found:

1. **The `noindex` rule for the preview addresses** (`https://:version.:subdomain.workers.dev/*` in `public/_headers`). It is the form the host documents for
   `workers.dev` (placeholders, each one label of the address; a pattern may hold only one `*`, so the first draft with two was replaced after a review). Step 3's `curl` is
   the proof that it works. If it is not sent, write the exact preview address in `public/_headers` (and keep the tests) or switch off the preview addresses in the dashboard.
   There is no rule for `pages.dev`: the site is not deployed to Pages.
2. **The generated Worker config.** The build writes `dist/client/wrangler.json` with the name `ahuzot-moses`, and a `SESSION` KV binding that the adapter adds
   by default and the site never uses. Watch what `wrangler deploy` creates in the account; if it makes an unused KV namespace, remove the binding.
3. **The preview addresses of other branches** (version and preview URLs under `workers.dev`) are covered by the same rule. Confirm with one `curl`.
4. **Redirect rules and HTTPS settings** are dashboard settings, not code: they are not in git and `launch:live` is what checks them. Write down the date of each change here.

Iron rules: S2 (HTTPS and HSTS), S18 (environments, rollback), E3 and E4 (canonical address, sitemap, robots).
