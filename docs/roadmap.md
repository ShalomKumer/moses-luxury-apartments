# Roadmap

Living list of what's next. `/new-feature` reads "Committed next" before starting a branch. "Where we stopped" is the
snapshot a new session reads first. Each stage names the iron rules it closes (`docs/compliance.md`).

## Stages

Seven stages (the user, 2026-11-01). **One stage is open at a time, and each stage is its own session**: inside a stage
`/compact` when the context fills; a stage closes only when the user says so - at its end, describe everything it holds
and ask whether to move on, then open the next one in a new session (or after `/compact`).

**After every merge, before any further work, report two figures:** the open stage's percent and the whole project's
percent, with what is left. Weights: a small feature counts 1, a medium one 2, a large one 3; percent = points done over
points. It is an estimate and is said to be one. A feature that turns out bigger is split before it starts, and the table
is corrected in the same PR.

| #   | Stage                    | What it holds                                                                                                                                  | Pts | Status                        |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------- |
| 1   | Foundations              | Architecture, the iron rules with the client's checklist, the first bilingual site on sample content, the working rules, git flow, the choice of the home design (`chore/foundations`, `chore/astro-7`, `feature/i18n-he-en`, `feature/design-home`: 2+1+3+3). | 9   | **Done** (merged 2026-11-01)  |
| 2   | Safety nets and tooling  | `chore/secret-scan` (1, merged); `chore/tooling` (1, merged): Prettier and ESLint, the performance budget, the photo script, `docs/owner-guide.md`; `chore/browser-tests` (1, merged): Playwright with axe at WCAG 2.2, the focus-not-obscured check. | 3   | **Done** (closed 2026-11-01)  |
| 3   | Design                   | `feature/design-apartment-page` (2, decided 2026-11-02: layout 1, gallery first); `feature/design-legal-pages` (1, approved 2026-11-02: one reading layout, `docs/design/legal.md`): the legal and system pages (404 and so on) in the chosen language, each with all its states. | 3   | **Done** (closed 2026-11-02)  |
| 4   | The design, built        | `feature/build-home` (3), the apartment page (2), the legal and system pages (1), with tests and a browser walk. Needs the fonts and photos. | 6   | **Done** (closed 2026-11-03)  |
| 5   | Content from the owner   | Business details, the real cabins, photos with their rights through the photo script, the English texts.                                       | 2   | **Open** (2026-11-03)         |
| 6   | SEO                      | `feature/seo` (2): Open Graph, Twitter Cards, canonical, sitemap, an honest JSON-LD, absolute `hreflang`; needs the domain.                    | 2   | Not started                   |
| 7   | Launch                   | Domain, HTTPS, host rules, axe and screen-reader pass, the lawyer's texts, `launch:check` green, the release PR from `dev` to `main`.          | 2   | Not started                   |

Total 27 points; 21 done (stages 1 to 4), about 78% of the project (an estimate); stage 5 is open (2026-11-03) and its first feature, `feature/add-artist-estate` (1 of 2 points), is built and waits for review and merge. An admin editor for the apartments is not a stage and is
not counted; it is built only if the user asks (below). Stage 4 was closed (the user, 2026-11-03) and the user opened stage 5 the same day, in a new session. Still to come from the owner: the
business details, the accessibility coordinator, the check-in and check-out times, the cancellation terms, the lawyer's texts.

The owner's and the lawyer's own track ("Before launch", at the end of this file) runs beside all of them.

## Where we stopped

A snapshot, not a history. Last update: 2026-11-03 (stage 5 opened; the Artist's Estate built).

- **Stage 1 is done and closed** (PR #1 and #2 merged into `dev`, 2026-11-01; `main` is still the empty first commit).
  It holds the architecture and the iron rules (`docs/architecture.md`, `docs/compliance.md`), the code structure
  (`docs/structure.md`), the first bilingual site on sample content, the working rules and skills (`CLAUDE.md`,
  `.claude/skills/`), and the chosen home design.
- **Stage 2 is done and closed** (PR #3, #4 and #5 merged into `dev`; the user closed it, 2026-11-01; `main` is still the
  empty first commit). It holds the secret scan (S19, S13), Prettier and ESLint with the template accessibility rules,
  the performance budget, the photo script and its check, `docs/owner-guide.md`, and the browser tests (Playwright and
  axe at WCAG 2.2 AA over every page at 1280 px and 375 px, the photo viewer by keyboard, the focus-not-obscured check,
  a test server that sends the real headers), all inside `npm run verify` (182 unit and 196 browser tests). Axe found
  nothing on the sample pages; it finds only part of the problems, so the screen-reader pass stays in stage 7.
- **Stage 3 is done and closed** (PR #7 and #8 merged into `dev`; the user closed it, 2026-11-02; `main` is still the
  empty first commit). It holds the apartment page design (five layouts, a scored comparison; **layout 1, gallery
  first**, with the phone jump button of 5 and the apartment rows of 2; `docs/design/apartment.md`) and the legal pages
  and 404 design (one reading layout with all its states; `docs/design/legal.md`), each with its exploration, its
  artifact and the rules for the build; axe found nothing at 1280 px and 375 px. The name stays as in the logo for now
  ("דירת מוזס", units are "דירות"; the user, 2026-11-02).
- **Stage 4 is done and closed** (PR #10, #11 and #12 merged into `dev`; the user closed it, 2026-11-03; `main` is still
  the empty first commit). It is the design, built: all its pages. `feature/build-legal-pages` was merged (PR #12,
  2026-11-03): the four legal pages and the 404 page of `docs/design/legal.md` (page head, table of contents, draft
  notice from the `draft` field, parts to fill as labelled boxes, the coordinator card, the cancellation-fees table as a
  structure, the current policy marked in the footer), and "צימרים" moved to "דירות" in the Hebrew legal texts; with it
  stage 4 holds all its pages. `feature/build-apartment-page` was merged (PR #11, 2026-11-02): the apartment page of
  `docs/design/apartment.md` (layout 1, the phone jump button, the other apartments as rows) and the booking request
  shared with the home page. `feature/build-home` was merged (PR #10, 2026-11-02):
  the home page of `docs/design/home.md` in Hebrew and English, with the booking-request bar, and the three fonts
  downloaded with the user's yes, cut to Hebrew and Latin and self-hosted (C1); with the legal pages, 240 unit and 334
  browser tests (10 skipped). Still to come from the user: the original logo file, photos with their rights, the business and coordinator
  details, the lawyer's texts. A new advisory (minimatch, moderate, in the lint chain) appeared in `npm audit` on
  2026-11-02; `audit:prod` fails on high only, so `verify` is green; to be updated with the next dependency change.
- **Stage 5 is open** (the user, 2026-11-03; the Artist's Estate content arrived the same day). `feature/add-artist-estate` is built on its
  branch and waits for `/ship`, review and merge (see "Committed next", 4e): the first real apartment with ten photos, srcset, the
  weight check that reads it, and a fix of a latent gallery rule (a sixth photo was shown on a wide screen). The user's answers: the
  name is "אחוזת האמן – בית דוד לבקובסקי"; the client took all the photos and made the logo (the user's word; written
  confirmation to come); both phones are WhatsApp; the sample apartments stay for now; the site is in Hebrew and English only. The
  questions to bring from the client (business details, coordinator, times, cancellation terms, an owner decision about the
  sample apartments, the domain) were listed in the chat on 2026-11-03.
- **Decided by the user, 2026-11-01:** the build-only licence exceptions in `scripts/check-licenses.mjs` (the sharp
  libvips binary, LGPL-3.0; lightningcss and its binary, MPL-2.0; axe-core and its Playwright wrapper, MPL-2.0, test-only; C4), and the one reviewed finding in
  `scripts/secret-scan/reviewed-findings.mjs`. Fourteen code-review findings were recorded and not fixed on purpose; they
  are picked up in stage 2 or with the page they touch. The missing design tokens are added by the first feature that
  needs each (`docs/standards.md` 8.3), not in the tooling branch.
- **Done 2026-11-01:** Node 22.23.4 and the move to Astro 7 and `@astrojs/cloudflare` 14 (the `vite` pin is gone):
  `npm run verify` passes, `npm audit` reports nothing (S14 is Met). The unused `SESSION` KV binding of the adapter is
  still to be checked at deploy.
- **The user's standards (2026-11-01):** `docs/standards.md` holds the development, security and Git standards and the fixed
  work cycle, merged with the existing rules (its last section lists what was kept). New rows in `docs/compliance.md`:
  L13, S18, S19 and E1-E6 (SEO). `CLAUDE.md` and both skills follow them.
- **Home page design (the user, 2026-10-31):** a large photo with a date search on it and more below (a reference site's
  layout, for layout only). The plan was approved ("מאשר") and the user chose to build it before the first commit
  (a one-time exception to the order of branches; `chore/foundations` still goes first when the repository exists,
  then this branch on top of `dev`). **Five layouts are built** (`docs/design/home.md`, the exploration in
  `docs/design/explorations/home-layouts.html`, and the published artifact); **decided (2026-10-31): the top of layout 2 and the bottom of layout 3** (`docs/design/home.md`, "Decision").
  **The logo arrived (2026-10-31) and dictates the style** (`docs/design/brand.md`): the palette is adopted in
  `tokens.css` and the contrast test, the logo is in the header, the layouts are redrawn in it. Fonts are proposed
  (Frank Ruhl Libre, Heebo, Gveret Levin, all OFL) and need the user's yes to download. Both phone numbers, the email
  and the logo's name and lines are in `src/config/site.ts`. **Open:** "דירת מוזס / דירות" (the logo) or
  "אחוזות מוזס / צימרים" (the first brief); the original logo file (vector or transparent PNG).

- **Availability removed from the site (the user, 2026-10-31):** no visitor sees whether a place is free or taken, and
  the date-search calendar is gone for everyone, the owner included. Removed: the calendar, the date selection, the
  `/api/availability` route and their tests (backup zip in `docs/archive/`); kept unwired for a future admin view:
  `src/domain/availability`, `src/server`. `tests/policy/no-public-availability.test.ts` enforces it. The owner keeps
  seeing his bookings in his own Google Calendars. **Open:** whether the owner needs to see availability *inside the
  site* (a sign-in, MFA, Argon2, rate limits, an on-request route: a feature of its own, planned with Opus), or Google
  Calendar is enough. **The home page design was redrawn the same day** with a booking-request card (the user's choice); five layouts; **the user chose (2026-10-31): the top of layout 2 and the bottom of layout 3**
  (`docs/design/home.md`, "Decision"). Building it is a feature of its own (below), not started.

- **Two requests (the user, 2026-10-31, later):** (1) the site in **Hebrew and English** (built, see "Committed next", 5); (2) **add, edit and remove an
  apartment, only by an admin**. Decisions so far: (2) is **deferred**: the user does not want registration or sign-in
  for now, and editing by an admin cannot be told apart from editing by anyone without some sign-in (ours, or an external
  gate such as Cloudflare Access with an emailed one-time code, or a git-based editor with its own sign-in). Until then
  the apartments are files (`src/content/cabins/`) that we change on the owner's word; that is also how an apartment is
  added or removed. (1) is planned as its own feature (below); it needs the English texts from the owner, and the legal
  texts in English need the lawyer. The user will pick the home layout separately.

## Committed next

In this order; each one is its own branch, and nothing starts before the one above it is merged.

1. Stage 1, `chore/foundations` (2): **done and merged, 2026-11-01.**
2. Stage 1, `chore/astro-7` (1): **done** (part of the first commit).
3. Stage 2, `chore/secret-scan` (1): **done and merged, 2026-11-01** - the secret scan of row S19 (files, `dist/`, git history), inside `npm run verify`.
3b. Stage 2, `chore/tooling` (1): **done and merged, 2026-11-01** - Prettier and ESLint, the performance budget
   (`scripts/budget/`), the photo script and its check (`scripts/photos/`), `docs/owner-guide.md`; all in `npm run verify`.
3c. Stage 2, `chore/browser-tests` (1): **done and merged, 2026-11-01** - Playwright with axe (rule 6 of
   `CLAUDE.md`) over every page at 1280 px and 375 px (`tests/e2e`), the WCAG 2.2 AA tags, a check that a focused link is
   not covered by another element (2.4.11), the photo viewer by keyboard, a test server that sends the real `_headers`
   (so the CSP is tested), and ESLint's Astro accessibility rules (`eslint-plugin-jsx-a11y-x`); all inside `npm run verify`.
   The user approved the Chromium download and the axe-core MPL-2.0 exception (2026-11-01).
4. Stage 1, `feature/design-home` (3): **done** (decided 2026-10-31; docs only, `docs/design/home.md`).
4a. Stage 3, `feature/design-apartment-page` (2): **done and merged, 2026-11-02: layout 1, gallery first** - five layouts,
   a comparison and a recommendation (`docs/design/apartment.md`); docs only.
4a2. Stage 3, `feature/design-legal-pages` (1): **done and merged, 2026-11-02** (`docs/design/legal.md`) - the legal pages and the 404 page in the chosen language, one layout with
   all its states (recommended: not five layouts, they are text pages), approved on their own; docs only.
4b. Stage 4, `feature/build-home` (3): **done and merged, 2026-11-02 (PR #10)** - the chosen home page with the request bar and its
   tests, and the self-hosted fonts. Real photos for the hero and the apartments, and the name decision, are still to come.
4c. Stage 4, `feature/build-apartment-page` (2): **done and merged, 2026-11-02 (PR #11)** - layout 1 of
   `docs/design/apartment.md` with the phone jump button and the apartment rows; "צימר" moved to "דירה" in the page and
   the sample content.
4d. Stage 4, `feature/build-legal-pages` (1): **done and merged, 2026-11-03 (PR #12)** - `docs/design/legal.md`: page head,
   table of contents, draft notice, the dashed "to fill" box, the coordinator card, the fees table (structure only),
   the 404 page; "צימרים" moved to "דירות" in the Hebrew legal texts.
4e. Stage 5, `feature/add-artist-estate` (1): **built 2026-11-03, waiting for review and merge** - "אחוזת האמן – בית דוד לבקובסקי" is the first real apartment
   (the owner's text in both languages, ten real photos through `npm run photos:add`, 14 guests, 6 bedrooms), first in the list; the home
   hero is its terrace; both phone numbers are WhatsApp; photos have a `srcset` and the weight check reads it; a photo beyond the
   grid is a link, not an `<img>`; the source folder `צימרים/` is git-ignored; the check-in and check-out times show nothing until the
   owner gives them (`launch:check` fails on them). The three sample apartments stay for now (the user). Still to come in stage 5 (1 point):
   the business details, the accessibility coordinator, the check-in and check-out times, the cancellation terms.

5. Stage 1, `feature/i18n-he-en` (3): **done and merged; built 2026-10-31** (the plan was approved by the user; there was no commit yet, so
   it is part of the first commit). Hebrew at `/`, English at `/en/`, a language link on every page, every text in both
   languages, 92 tests, the build and its language checks pass. The user approved the English texts of the UI, the
   brand lines and the sample apartments (2026-10-31). Open: the lawyer's approval of the four English legal pages; `hreflang` links are
   relative until the domain is known (they need absolute addresses and `site` in `astro.config.mjs`); the home layout
   must be checked left to right once it is chosen.
6. Stage 6, `feature/seo` (2): Open Graph, Twitter Cards, canonical, sitemap, an honest JSON-LD (rows E2-E5); needs the domain and a preview image of ours.
7. Later, only if the user asks: an admin editor for apartments behind a sign-in (its own plan, with Opus).

The design branch is docs only (an artifact and `docs/design/home.md`), so the user may move it before 2 and 3.

## Before launch: the owner and the lawyer

Not code; the site waits for these.

- Business details: legal name, business number, address, phone for WhatsApp, booking email, accessibility coordinator
  (L11, A6).
- Per cabin: name, descriptions, capacity, rooms, features (each one true: H1), prices if shown, check-in and check-out
  times, minimum age (L10).
- Photos the owner holds the rights to, with their source (C3).
- The owner keeps his bookings in his own Google Calendars (the site reads none). Two-step verification on his Google
  account, and a monthly export of the calendars (S8). No calendar address is needed by us unless an admin view is built.
- Cancellation terms: deposit, fees, deadlines (H4).
- The final text of the privacy policy, terms, cancellation policy and accessibility statement.
- Amendment 13 to the Privacy Protection Law, and whether GDPR applies (guests from the EU).
- The business licence and any Ministry of Tourism requirement for holiday cabins.
- The scope of the accessibility regulations for this business, and the accessible features of the cabins themselves.
- Invoices for bookings (the owner's accountant).
