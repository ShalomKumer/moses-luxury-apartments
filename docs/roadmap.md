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

Total 27 points; 22 done (stages 1 to 4 and the first feature of stage 5), about 81% of the project (an estimate); stage 5 is open (2026-11-03), at about 60% (four real apartments are in; before that about 50%): its first feature, `feature/add-artist-estate` (1 of 2 points), is merged (PR #14). An admin editor for the apartments is not a stage and is
not counted; it is built only if the user asks (below). Stage 4 was closed (the user, 2026-11-03) and the user opened stage 5 the same day, in a new session. Still to come from the owner: the
business details, the accessibility coordinator, the check-in and check-out times, the cancellation terms, the lawyer's texts.

The owner's and the lawyer's own track ("Before launch", at the end of this file) runs beside all of them.

## Where we stopped

A snapshot, not a history. Last update: 2026-11-08 (stage 5 open; four real apartments built and the three sample apartments removed, so the site shows real content only; an apartment page shows the next three apartments and a row loads the smallest photo file on a phone). The detailed document for the owner is written (`docs/owner-requests.md`, with a Word copy; 4l). The fifth apartment "אחוזת המעיין" is built and merged (4m, PR #23); about 11 more follow. The home page weighs 417 KB on a phone with five apartments; it shows the first five and folds the rest behind a quiet "show more" pill (4n, merged, PR #24), so it stays about that light however many apartments there are. The booking and contact links are reworked (4o, merged, PR #26) and the English top of the home page on a phone is back to two lines (PR #27). The rest of the user's list of ten changes follows in order d, c, e, f (see 4o). The sixth and seventh apartments are merged (4p, PR #28; 4q, PR #29); the eighth, "מעיין א׳" (4r, PR #30), is merged and the ninth, "מעיין ב׳" (4s, PR #31), is merged the tenth, "נוביליטי 1" (4t), and the eleventh and twelfth, "נוביליטי 2" and "נוביליטי 3" (4u, 4v), are built on one branch, `feature/add-nobility-1`, in review (the user said to go on until every apartment is on the site). The thirteenth, "צימר ט״ז 8" / "Tet-Zayin 8" (4w), is on the same branch; no apartment sent so far waits. The apartments come first, before the logo swap and the rest of the user's list.

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
- **Stage 5 is open** (the user, 2026-11-03; the Artist's Estate content arrived the same day, and those of Atzulat HaKikar B and A later that day). `feature/add-artist-estate` is merged
  (PR #14; see "Committed next", 4e), and `fix/artist-estate-name` corrects the name: the first real apartment with ten photos, srcset, the
  weight check that reads it, and a fix of a latent gallery rule (a sixth photo was shown on a wide screen). The user's answers: the
  name is "אחוזת האמן-בית לבקובסקי"; the client took all the photos and made the logo (the user's word; written
  confirmation to come); both phones are WhatsApp; the sample apartments stayed until `feature/remove-sample-apartments` (4k); the site is in Hebrew and English only. The
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
4e. Stage 5, `feature/add-artist-estate` (1): **done and merged, 2026-11-03 (PR #14)** - "אחוזת האמן-בית לבקובסקי" is the first real apartment
   (the owner's text in both languages, ten real photos through `npm run photos:add`, 14 guests, 6 bedrooms), first in the list; the home
   hero is its terrace; both phone numbers are WhatsApp; photos have a `srcset` and the weight check reads it; a photo beyond the
   grid is a link, not an `<img>`; the source folder `צימרים/` is git-ignored; the check-in and check-out times show nothing until the
   owner gives them (`launch:check` fails on them). The three sample apartments stayed until 4k removed them. Still to come in stage 5 (1 point):
   the business details, the accessibility coordinator, the check-in and check-out times, the cancellation terms.
4f. Stage 5, `feature/add-atzulat-hakikar-b` (content of the same kind as 4e, counted in its point, the total stays 27): the second real
   apartment, "אצולת הכיכר ב׳" / "Atzulat HaKikar B" (4 bedrooms, 11 beds, 3 bathrooms, a spa jacuzzi, a courtyard; ten photos, the main one
   `3E6A9113`), second in the list, the samples after it; the real-apartment browser tests are now one table (`tests/e2e/real-apartments.spec.ts`)
   and a prompt for adding an apartment is `docs/new-apartment-prompt.md`. The guest cap (11, from the beds) waits for the owner.
4g. Stage 5, `feature/add-atzulat-hakikar-a` (content of the same kind, counted in its point, the total stays 27): the third real apartment, "אצולת הכיכר א׳" /
   "Atzulat HaKikar A" (4 bedrooms with 3 master suites, 11 beds, 4 bathrooms, 2 jacuzzis, a private heated pool in an enclosed structure, a balcony and a
   courtyard; ten photos, the main one `DSC04226`), third in the list, the samples after it. **The user's standing rule (2026-11-03):** every real
   apartment lists Wi-Fi in its features, and a jacuzzi when it has one (Atzulat HaKikar B got its Wi-Fi line; a test enforces it for the real
   apartments; the sample apartments are not covered). Held back until the owner shows the photographer's licence: 14 photos (`IMG_xxxxBW`) with
   the watermark "ALON art & photography", the only ones that show the pool. The pool itself and the guest cap (11, from the beds) wait for the owner. The page-weight check failed for the Artist's Estate and this page
   (the main photo is a row on the other pages), so `npm run photos:add` got `--page-kb=<n>`, a lower ceiling for the 640, 960 and 1280 files (the user chose this
   over a higher budget or another main photo); a fourth real apartment will probably need the row photos shrunk for good (done in 4h).
4h. Stage 5, `feature/shrink-row-photos` (counted in the same point, the total stays 27): every photo now also has a **960 px** file (`WIDTHS` in 
   `scripts/photos/limits.mjs`), the smallest at least 750 px wide, which is what a phone 375 px wide at twice the density loads, so the weight check 
   counts it instead of the 1280 file; the 30 real photos were put through `photos:add` again on the same sources and settings (the other widths came out 
   byte-identical). Measured on a phone (build output, 2026-11-03): Atzulat HaKikar A 970 -> 844 KB, the Artist's Estate 942 -> 787 KB, Atzulat HaKikar B 
   759 -> 643 KB (the 1 MB ceiling is unchanged). Room for about two more real apartments (each adds its row, about 60 to 100 KB, to every other apartment's page); a phone at three times the 
   density still loads the 1280 file, as before.
4i. Stage 5, `feature/add-tarpat-18` (content of the same kind, counted in the same point, the total stays 27): the fourth real apartment, "תרפ"ט 18" /
   "Tarpat 18" (a family villa: 4 bedrooms, 9 beds, 2 bathrooms, a Shabbat kitchen, a courtyard of about 100 m² with a panoramic view; Wi-Fi from the owner's text),
   third in the list (order 3), the samples after it; ten photos, the main one the daytime courtyard. **Left out:** the entrance picture (marked as made
   by ChatGPT in its own file) and the sunset picture (it looks like an edited copy of the daytime one); the user chose the daytime photo as the main one and
   agreed to the new rule that no photo made or edited by AI is shown as a photo of an apartment (`docs/compliance.md` C3, `docs/owner-guide.md`,
   `docs/new-apartment-prompt.md`). The main photo and the seating photo are phone screenshots (cut to 3:2), so the main photo has only the 640 and 960 files and the seating
   photo 640, 960 and 1280; **to ask the owner: the originals, who took the `AL6_*` photos (and a licence if a photographer did), and the guest cap (9, from the beds).**
   Measured on a phone (2026-11-03): Tarpat 18 811 KB, Atzulat HaKikar A 844 -> 941 KB, the Artist's Estate 787 -> 884 KB, Atzulat HaKikar B 643 -> 740 KB, the samples
   about 440 KB: **no room was left for a fifth real apartment** (fixed by 4j below).

4j. Stage 5, `feature/lighter-apartment-rows` (counted in the same content point; built 2026-11-04, the user approved the plan): an apartment's page shows the **next three**
   apartments (wrapping to the start) and an "All apartments" button instead of every other apartment, and on a phone (up to 480 px) a row loads the photo's smallest file (640 px; a `<picture>`
   whose narrow-screen `<source>` the weight check reads). The page no longer grows with the number of apartments. Measured on a phone (2026-11-04): Atzulat HaKikar A 941 -> 770 KB, the Artist's Estate 884 -> 763 KB,
   Tarpat 18 811 -> 578 KB, Atzulat HaKikar B 740 -> 571 KB, the samples about 440 -> 150 to 220 KB, the home page 431 -> 351 KB. The home page still lists every apartment (about 30 to 60 KB each), so it
   has room for roughly 18; past that it needs a design decision (a limit with "show more", for the user). The budget is unchanged. Next, in the order the user set: remove the sample apartments, the
   detailed document for the owner, then the fifth real apartment "אחוזת המעיין" (its text is saved; the main photo is `IMG_8888_89_90_tonemapped`).
4k. Stage 5, `feature/remove-sample-apartments` (counted in the same content point; built 2026-11-04, the user approved the plan): the three sample apartments (Gefen, Zayit, Teena) with their drawn SVG photos,
   the sample banner, the `SITE.isSample` flag and its launch check are gone; the site lists the four real apartments. The browser tests that read the samples now read the Artist's Estate (ten photos, 14 guests) and Tarpat 18
   (9 guests); the one-photo and three-photo browser tests are dropped (every real apartment has ten photos; `galleryShape` keeps its unit tests). Measured on a phone (2026-11-04): the rows of "other apartments" now hold real photos,
   so the pages grew: Atzulat HaKikar A 770 -> 835 KB, the Artist's Estate 763 -> 762 KB, Tarpat 18 578 -> 691 KB, Atzulat HaKikar B 571 -> 608 KB, the home page 351 -> 346 KB; all under the 1,000 KB ceiling.
4l. Stage 5, `docs/owner-document` (docs only, counted in the same content point): `docs/owner-requests.md`, the plain-Hebrew document the user sends the owner, and a Word copy of it
   (`צימרים/בקשות-מהבעלים.docx`, git-ignored, made from the Markdown). It lists what is already received, then what is needed before launch, each with a place for the answer: the business
   details (legal name, business number, address, the name shown, the domain), the accessibility coordinator and the apartments' accessible features, the check-in and check-out times and the house rules, the
   cancellation terms (deposit, fees, refunds), written confirmation of the photos' and the logo's rights and the logo original, and the questions for each apartment (guest caps 9 and 11, the pool and the ALON
   licence in Atzulat HaKikar A, the originals and the `AL6_*` photographer in Tarpat 18, the photos left out as made or edited by AI). Then the points for the owner's lawyer and accountant (the final legal texts,
   Amendment 13, GDPR, licensing, accessibility scope, invoices) and what to send for each new apartment. Every item `launch:check` fails on has a question there, except the third home-page point, which is asked as 7.1.
   Next, in the user's order: the fifth apartment "אחוזת המעיין". Found on the way, not done: four comment lines in `src/domain/text/fill-markers.ts` and `src/markdown/fill-markers-plugin.ts` quote the fill marker, so `launch:check` would fail on them
   even when everything is filled (a small code fix, its own branch).
4m. Stage 5, `feature/add-ahuzat-hamaayan` (counted in the same content point): the fifth real apartment, "אחוזת המעיין" / Ahuzat HaMaayan (`order: 4`, after Tarpat 18). The owner's text in both languages (2 double bedrooms, 2 sleeping lofts for up to 5, 2 bathrooms, a jacuzzi in one of the master bedrooms, a Shabbos kitchen, wall murals, a private courtyard with views), 9 guests, Wi-Fi. Ten photos through `photos:add`: six HDR photos of 2014 (the main one is the bedroom with the jacuzzi; Photomatix and Photoshop, no mark of an AI tool; the others of the folder were the same rooms again, a street photo, a tiny picture, or the same terrace three times), one phone photo of the terrace and three WhatsApp copies (two lofts, the kitchen) that are used until the originals are sent. Left out of the folder: 3 pictures of 414 px, 5 other angles of the same rooms, 3 more terrace photos and the street photo.
   **The file of six photos names a creator, "Alon Mandel old city tzfat" (the same name as the ALON art & photography photos held back for Atzulat HaKikar A); the files of 7 photos of the Artist's Estate and 10 of Atzulat HaKikar A name "NETANEL AV"; the three `AL6_*` photos of Tarpat 18 name nobody.** Every such row in `src/content/photos.md` says `creator or photographer to be confirmed`, and `npm run launch:check` now fails on it. The owner is asked in `docs/owner-requests.md` (5.5, 6.12 to 6.15). The user says (2026-11-04) the owner paid for the photographs or took them himself; that is recorded as the basis, but the written confirmation is still needed. **The site does not go live until he names the photographers and shows their written confirmation that the photos were made for him and may be used on the site.**
   Phone weight: the apartment's own page first came to 1208 KB (five detailed HDR photos at 960), over the 1000 KB ceiling, and `--page-kb=120` could not fix it (it also lowers the 1280 file, which then needed quality 42). So `photos:add` got `--phone-kb=<n>`, which lowers only the 640 and 960 files (the ones a phone loads); the five grid photos use `--phone-kb=100`, and the page weighs 938 KB (936 in English); the home page 415 KB (413); the other apartment pages are unchanged, because the new one is not among their next three. A unit test covers the new flag. The budget numbers are unchanged.
   Tests: one entry in `real-apartments.spec.ts` (ten photos, 9 guests, the Wi-Fi line); the wrap-around test now uses the new last apartment. 275 unit tests, 496 browser tests passed (10 skipped), `npm run verify` exit 0.
4n. Stage 5, `feature/home-show-more` (counted in the same content point; the user approved the plan and asked for five rows by default and a gentler control, 2026-11-08): the home page shows the first five apartments and folds the rest. Why: every apartment added about 70 KB to its first load on a phone (415 KB with five), so it would have passed the 1 MB ceiling at about the thirteenth of the owner's sixteen.
   A native `<details>` (`MoreApartments.astro`), so it opens by click, Enter or Space and works without JavaScript; its control is a quiet pill (a 1 px outline in the border colour, muted text, a chevron cut with `clip-path` so it is the same in both directions) between two hairlines, and says "Show N more apartments" (one: "Show one more apartment"), then "Hide the other apartments". The folded rows keep alternating sides (`ApartmentRow` takes `flip` instead of a CSS `nth-child` rule). `splitList` (domain, tested) does the split; `ROWS_SHOWN` is 5 in `HomePage.astro`.
   Their photos are lazy, so none is fetched until it opens, and `scripts/budget/page-weight.mjs` does not count a lazy image folded inside a closed `<details>` (an eager one, or a `<details open>`, still counts). Nothing is folded yet, since there are exactly five apartments: the fold appears with the sixth, and the browser tests of the fold skip until then (one test checks that nothing is folded up to five). They were run, with `ROWS_SHOWN` set to 3 for the run only, in Hebrew and English on desktop and phone: the rows beyond the fold load no photo until opened, it opens and closes by keyboard, works without JavaScript, and axe finds nothing while open.
   Phone weight: the home page 417 KB (was 415; +2 KB of the component's CSS), every other page unchanged; with 16 apartments the home page stays about that weight. 282 unit tests, 500 browser tests passed (28 skipped), `npm run verify` exit 0.
4o. Stage 5, `fix/booking-links` (the user's list of ten changes, 2026-11-08, part 1; counted in the same content point): the booking and contact links. WhatsApp and Gmail buttons carry an icon and open in a new tab (`target="_blank" rel="noopener noreferrer"`, "opens in a new tab" for a screen reader); the Gmail button opens Gmail's compose window (`gmailComposeLink`), because the old `mailto:` link did nothing on a computer with no mail program, and a smaller "or use the mail app on your device" link keeps the `mailto:`. The contact section and the footer show an icon for the phone and the envelope, the numbers dial with an international `tel:+972...` link (`telLink`), and the address has a small Gmail link beside it. Three icons, drawn from path data (`src/components/ui/icons/icon-paths.ts`, `Icon.astro`), their licences beside them: Lucide (ISC) and the Simple Icons WhatsApp mark (CC0; Meta's trademark stays Meta's, so C2 is _Partial_ until the lawyer confirms its use). The privacy policy says Gmail is a Google service and the site neither receives nor stores the message.
   **The rest of the user's ten (each its own branch, after this one is merged), decided 2026-11-08:** (b) `fix/english-phone-header`: **done and merged, 2026-11-08 (PR #27)** - the top of the English home page was about 135 px taller than the Hebrew one on a phone: the headline and the slogan wrapped to three lines each (the headline was held to 18 characters), and the request bar's English texts are longer. On a phone only, English now gets a 1.5 rem headline with no character limit and a 1.25 rem slogan: two lines each, as in Hebrew (the hero is now 1019 px against 972, from 1106); a browser test keeps both to two lines in both languages. (d) `feature/apartment-facts`: Wi-Fi and a jacuzzi, and what is special, in each apartment's details, only facts the owner gave. (c) `feature/booking-request-form`: one date-range picker in place of two date selects, in the style of the user's screenshot (two months side by side on a desktop, one on a phone, the nights between the two ends lightly shaded, past days greyed and not selectable, no availability shown anywhere, optional "flexible by 1, 2 or 3 days" chips - to ask in the plan), then a couple count and a child count (a couple is two people, each child is one) with the total worked out and editable (capped at the apartment's guests), and a name line in the message (typed text goes into the message only, never stored); on the home page and on an apartment page. (e) `feature/directions`: Waze, Google Maps and others for each apartment; waits for the locations the user will send. (f) `feature/language-suggestion`: not a redirect by IP (it would hide the Hebrew pages from a search crawler that comes from the US, and changes the page without the visitor's choice, WCAG 3.2); a closable "Switch to English?" offer for a visitor whose browser is not in Hebrew, with no data collected.
4p. Stage 5, `feature/add-panorami-yerushalayim-97` (counted in the same content point): the sixth real apartment, "פנורמי ירושלים 97" / "Panorami – 97 Jerusalem Street" (`order: 5`, after Ahuzat HaMaayan). The owner's text in both languages (6 bedrooms, 6 bathrooms, 18 beds, scenic balconies, a huge living room, a Shabbos kitchen), 18 guests by the number of beds (to confirm, 6.16), Wi-Fi by the standing rule, and one feature that is in the photos and not in the text, "exposed stone walls and arched ceilings in parts of the villa" (the user approved it). "Maximum privacy" is left out because only the Hebrew text says it. Ten photos through `photos:add` from the 23 phone photos of one afternoon (Samsung Galaxy S24 FE, 2026-04-27, no creator and no mark of an AI tool in the files); the main one is the bedroom with the chandelier, as the user chose; five of the ten (the kitchen, the balcony, the dining lounge, the sofa, the shower) were cut to 1600 px first because a 1920 file needed too low a quality, so they have the 640, 960 and 1280 files only. Left out: the stairs (a portrait photo), the street photo (cars with plates), a third of the rest as other angles of the same rooms. The rights rows say the owner or his client took them, the user's word, with the written confirmation still to come (6.17), and the owner is asked the new questions in `docs/owner-requests.md` (6.16 to 6.20); the Word copy of that document is to be made again before it is sent.
   With the sixth apartment the home page shows five rows and folds one behind the "show more" pill, so its browser tests no longer skip.
4q. Stage 5, `feature/add-avira-drashbi` (counted in the same content point): the seventh real apartment, "אווירא דרשב"י" / "Avira D'Rashbi" (`order: 6`, after Panorami). The owner's text in both languages (6 bedrooms, 4 bathrooms, 3 jacuzzis, a dry sauna, a balcony with a view of Mount Meron, a large living room, a Shabbos kitchen, up to 14 guests), Wi-Fi by the standing rule. "Private" in front of the sauna is left out because only the English text says it; the gas grill in one photo is left out because the text does not mention it. Ten photos through `photos:add` from 32 professional photos of 2023-05-15 (Nikon Z 7_2; no photographer's name and no mark of an AI tool in the files); the main one is the bedroom `DSC_5638`, as the user chose; two (the view and the balcony) were cut to 1600 px first, so they have no 1920 file. Every rights row says `creator or photographer to be confirmed` (a shoot this good has a photographer), so `launch:check` fails on it until the owner answers 6.23. With it the home page folds two apartments.
   The next apartment, Ma'ayan A, uses photos that name "ALBERT ADOUT" as the rights holder (five of them, the main one among them) and "Alon Mandel old city tzfat" (three); a third, Ma'ayan B, is the same suite with the same photos and another text (the user, 2026-11-08). Both wait for 4q to merge.
4r. Stage 5, `feature/add-maayan-a` (counted in the same content point): the eighth real apartment, "מעיין א׳" / "Ma'ayan A" (`order: 7`), a couples' stone suite with a private courtyard and a large jacuzzi. The owner's text in both languages, 2 guests (a couples' suite, to confirm, 6.26), Wi-Fi by the standing rule, and a sleeping loft with wooden stairs that the photos show (the user said to add it). **Eight photos, not ten:** the other six files are small (414 px) or copies of a website's pictures with no known source, so they stay out. Seven of the eight were cut to 1600 px or come from a 1500 px source, so only the "stairs and kitchenette" photo has a 1920 file. Five photos name "ALBERT ADOUT" as the rights holder, three name "Alon Mandel old city tzfat"; every row says `creator or photographer to be confirmed` (5.5, 6.27). The browser tests got a `photos` field (ten by default) and a `secondWidth` field, so an apartment may hold fewer than ten photos. The apartment's own page first weighed 1213 KB on a phone (over the 1,000 KB ceiling: stone and foliage are detailed), so the five grid photos were made with `--phone-kb=100` (the 960 file at quality 42 to 74) and the page weighs 917 KB (915 in English). With it the home page folds three apartments.
   **Decided with the user (2026-11-08):** Ma'ayan B, a different unit that uses the same photos with another text, will point at the same files (`/photos/maayan-a/...`) and its description will not say the suites are alike; Nobility 1, 2 and 3 and "צימר ט״ז 8" are queued after it.
4s. Stage 5, `feature/add-maayan-b` (counted in the same content point): the ninth real apartment, "מעיין ב׳" / "Ma'ayan B" (`order: 8`), another couples' suite that shows the same eight photo files as Ma'ayan A (`/photos/maayan-a/...`; no file added, so no new rights row and no weight added to the repository). Its own text in both languages, 2 guests (to confirm, 6.31), Wi-Fi and the sleeping loft like Ma'ayan A; its description does not say the suites are alike (the user's word). The browser tests got a `photoFolder` field (the id by default). The owner is asked for photos of Ma'ayan B itself (6.30). With it the home page folds four apartments.

4t. Stage 5, `feature/add-nobility-1` (counted in the same content point): the tenth real apartment, "נוביליטי 1" / "Nobility 1" (`order: 9`), a couples' suite with a private balcony and a panoramic view. Eight photos from the owner (Nikon and Sony, saved in February 2022; no creator named; the main one is the interior view, under 1920 px wide, so it has no 1920 file), its text in both languages from the owner without the title line, Wi-Fi by the standing rule, no jacuzzi (the text has none), 2 guests (to confirm, 6.32). The wrap-around test now ends on it. The owner is asked who took the photos (6.33) and about the towel that reads "NOBILITY BOUTIQUE SUITES" (6.34). With it the home page folds five apartments.
4u. Stage 5 (the same branch, counted in the same content point): the eleventh apartment, "נוביליטי 2" / "Nobility 2" (`order: 10`), a couples' suite with a separate bedroom, a living room, **a large couples' jacuzzi** and a private balcony with a panoramic view. Ten photos from one Sony A7 IV session (2025-08-05; no creator named; the main one is `DSC05903`), the owner's text in both languages without its title line, Wi-Fi by the standing rule, 2 guests (to confirm, 6.35). Portrait photos (both bathroom shots) were left out. The owner is asked where the jacuzzi is (6.36), who took the photos (6.37) and what the balcony photos show (6.38).
4v. Stage 5 (the same branch): the twelfth apartment, "נוביליטי 3" / "Nobility 3" (`order: 11`), the same kind of suite with its own ten photos (main `DSC05812`); the three balcony shots both folders held are shown only in Nobility 2, so no photo is shown for two units (H1). 2 guests (to confirm, 6.39). The wrap-around test now ends on it. With both, the home page folds six apartments.
4w. Stage 5 (the same branch): the thirteenth apartment, "צימר ט״ז 8" / "Tet-Zayin 8" (`order: 12`; the user chose the English name and the page address `tet-zayin-8` on 2026-11-09, because the English text had none), a romantic stone suite in a restored Arab house in Old Tzfat with **a large couples' jacuzzi**. Six photos from 1024 px web copies (no camera data; so only 640 and 960 files; the main one is `IMG_0069a`); a copy of the main photo and an outdoor tone-mapped square were left out. The owner's text in both languages without its title and tagline lines, Wi-Fi by the standing rule, 2 guests (to confirm, 6.42). The owner is asked for the originals and the photographer (6.43, 6.44). The browser tests take `gridSrc` of 960 for it. With it the home page folds seven apartments.
4x. Stage 5, `fix/maayan-b-main-photo` (counted in the same content point): Ma'ayan B now opens on the living area with the wooden loft (`living-loft`, the owner's `ALB_8759-1.jpg`) instead of the vaulted bedroom that leads Ma'ayan A (the user, 2026-11-09). The same eight files, reordered; no file added, the page weight unchanged (the same five grid photos).
4y. Stage 5, `feature/apartment-facts` (the user's list of ten, item 8; counted in the same content point): an apartment's details now show a **bathrooms** tile and a row of **badges** with a small icon and a word (Wi-Fi, Shabbos kitchen, jacuzzi with its count, sauna, pool, view, balcony, courtyard, loft, separate bedroom, stone walls, wall murals), and the home page's rows show up to three of the badges that set the apartment apart. The user's rule (2026-11-09): a feature that is a badge is also written in the apartment's text, so the build fails on a badge with no line in the features in either language and on an apartment without Wi-Fi (`content.config.ts`, `src/domain/apartments/highlights.ts`, `tests/policy/highlights.test.ts`). The Shabbos kitchen is on every apartment (the user's word), so Atzulat HaKikar A and B got that line; air conditioning has no badge until the owner says where (6.45); "accessible for people with disabilities" comes later, when the user confirms it per apartment (6.46). Eleven Lucide icons added (ISC). Not touched: the photos, the page weight.
4z. Stage 5, `fix/logo-swap` (the user's list, the logo; counted in the same content point): the site uses the logo file the user sent on 2026-11-08 (`moses_combined_logo.png`: the same lockup with two English lines added). `npm run brand:build -- <file>` (`scripts/brand/ink-bounds.mjs`, `build-logo.mjs`) cuts two WebP files from it: the whole lockup (the contact area, in both languages) and the roof with both names (the top of every page; the small English lines would not be legible at 60 px, so it keeps what it showed). `src/config/site.ts` now gives each file its own width and height, and a test checks them against the files. The first original stays in `docs/design/brand/`. The favicon still waits for the owner's vector file.

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

- **For the lawyer (added 2026-11-08):** the use of the WhatsApp mark on the booking buttons and in the contact section (compliance C2).

Not code; the site waits for these. The owner's side is written for him, with a place for each answer, in `docs/owner-requests.md`.

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
