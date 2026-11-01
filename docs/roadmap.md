# Roadmap

Living list of what's next. `/new-feature` reads "Committed next" before starting a branch. "Where we stopped" is the
snapshot a new session reads first. Each stage names the iron rules it closes (`docs/compliance.md`).

## Stages

**One stage is open at a time, and a stage closes only when the user says so**: at its end, describe everything it
holds and ask whether to move on. After every feature, report the open stage: what it is, what was done, what is left,
and the percent (a small feature counts 1, a medium one 2, a large one 3; the figure is an estimate and says so).

| #   | Stage                 | What it holds                                                                                                                      | Status                                                                     |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Foundations           | Architecture, the iron rules with the client's checklist, the first working site on sample content, the working rules, git flow.  | **Open**: the first commit and push, and Astro 7 after the Node upgrade.   |
| 2   | Design                | The palette and type (the DNA), then page by page: home (five layouts), cabin page, legal and system pages.                         | **Open**: the home page has five layouts, waiting for the user's decision. |
| 3   | The design, built     | Each approved page rebuilt in the code, with its states, tests and a browser walk.                                                  | Not started                                                                |
| 4   | Content from the owner | Business details, real cabins, photos with their rights, the calendars, the cancellation terms.                                   | Not started                                                                |
| 5   | Launch                | Domain, HTTPS, host rules, the calendar secret, monitoring, axe and screen-reader pass, the lawyer's texts, `launch:check` green. | Not started                                                                |

The owner's and the lawyer's own track ("Before launch", at the end of this file) runs beside all of them.

## Where we stopped

A snapshot, not a history. Last update: 2026-11-01.

- **Stage 1** is open. Done: the architecture and the iron rules (`docs/architecture.md`, `docs/compliance.md`), the
  code structure (`docs/structure.md`), the first working site on sample content (pages, legal drafts, the availability
  endpoint and calendar, the booking panel; 82 tests, the build and its output check green, walked in the browser), and
  the working rules taken from the trading-bot project (`CLAUDE.md`, `.claude/skills/`). About 80% (an estimate).
- **Left in stage 1:**
  - The GitHub repository (the user creates it; no `gh` CLI) and the first commit: `main` gets an empty first commit,
    `dev` is cut from it, and everything so far goes in `chore/foundations` through `/code-review`, `/security-review`
    and `/ship`. **Nothing is committed yet: the work exists only in the working folder.** `npm run verify` is now green.
  - Three build-only licence exceptions in `scripts/check-licenses.mjs` (the sharp libvips binary, LGPL-3.0; lightningcss and
    its binary, MPL-2.0) wait for the user's approval (C4); they are still installed under Astro 7.
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

1. Stage 1, `chore/foundations` (2): the first commit of everything so far, through the full lifecycle.
2. Stage 1, `chore/astro-7` (1): **done in the working tree, 2026-11-01** (part of the first commit).
3. Stage 1, `chore/secret-scan` (1): the secret scan of row S19 (sources, docs, `dist/`, git history), inside `npm run verify`.
3b. Stage 1, `chore/tooling` (2): the rules the user added on 2026-10-31 (`CLAUDE.md`): Prettier and ESLint, Playwright
   with axe, the performance budget check, the photo script, `docs/owner-guide.md`. Each new dependency through the
   licence check; axe-core (MPL-2.0) and the photo tool need the user's yes as build-only exceptions.
4. Stage 2, `feature/design-home` (3): **done** (decided 2026-10-31; docs only, `docs/design/home.md`).
4b. Stage 3, `feature/build-home` (3): build the chosen home page in the code, with the request bar and its tests; needs the
   fonts (the user's yes to download), real photos for the hero and the apartments, and the name decision.

5. `feature/i18n-he-en` (3): **built 2026-10-31 in the working tree** (the plan was approved by the user; there was no commit yet, so
   it is part of the first commit). Hebrew at `/`, English at `/en/`, a language link on every page, every text in both
   languages, 92 tests, the build and its language checks pass. The user approved the English texts of the UI, the
   brand lines and the sample apartments (2026-10-31). Open: the lawyer's approval of the four English legal pages; `hreflang` links are
   relative until the domain is known (they need absolute addresses and `site` in `astro.config.mjs`); the home layout
   must be checked left to right once it is chosen.
6. Stage 3, `feature/seo` (2): Open Graph, Twitter Cards, canonical, sitemap, an honest JSON-LD (rows E2-E5); needs the domain and a preview image of ours.
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
