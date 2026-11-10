# Code structure

Set on 2026-10-31, updated the same day after availability was removed from the site (`docs/architecture.md`). Modular and
component-based: one responsibility per file, small functions, UI, business logic and API calls in separate layers.
Every exported function carries a one-line comment saying what it does.

## Folder tree (as it is now)

```
/
├── astro.config.mjs                # static pages (Cloudflare adapter); no env variables today
├── package.json                    # scripts: dev, build, test, format, lint, verify, test:e2e, photos:add, photos:check, fonts:build, brand:build, budget:check, secrets:check, licenses:check, launch:check
├── scripts/secret-scan/            # the secret scan (S19): patterns, scan-text, forbidden-files, list-sources,
│                                   #   parse-history + scan-history, report, reviewed-findings, check-secrets (entry)
├── .prettierrc.json, eslint.config.mjs   # formatting (code only) and lint (with the a11y template rules), both in verify
├── playwright.config.ts            # the browser tests: desktop 1280 px and phone 375 px, the test server
├── tsconfig.json                   # strict; path aliases per layer (@domain, @server, ...)
├── vitest.config.ts
├── .env.example                    # empty today (no variables)
│
├── public/
│   ├── _headers                    # security headers: CSP, HSTS, nosniff, frame (S2, S10)
│   ├── brand/                      # the owner's logo, cropped (docs/design/brand.md)
│   ├── photos/<cabin-id>/          # cabin photos; source and rights in src/content/photos.md (C3)
│   └── robots.txt
│
├── src/
│   ├── content.config.ts           # collection schemas; photo alt is required (A2)
│   ├── content/                    # data, no logic: cabins/<id>.md (both languages in one file), legal/{he,en}/<page>.md, photos.md
│   ├── i18n/                       # PURE: locales (he, en, direction), paths (the address of a page in a language), pick,
│   │   │                           #   get-messages, messages/{he,en,types}.ts (every text of the site, same keys)
│   ├── config/
│   │   ├── site.ts                 # brand, business details, phones, email, logo (L11)
│   │   └── availability.ts         # limits of the kept availability service (not wired)
│   │
│   ├── domain/                     # BUSINESS LOGIC: pure functions, no I/O, no DOM
│   │   ├── dates/                  # date-key, date-range, format-date, month
│   │   ├── scroll/                 # back-to-top (how far the page must be scrolled before the button shows)
│   │   ├── apartments/             # next-apartments (the next few apartments after one, wrapping to the start), split-list (the home page: shown and folded), highlights (the badges: kinds, order, the words each needs in the text, the label with a count)
│   │   ├── booking/                # booking-message, phone-number, whatsapp-link, mailto-link, gmail-link, tel-link, stay-dates, guests, party (couples, children and the total within the apartment's guests), guest-name (the name made safe for the message)
│   │   ├── gallery/                # gallery-shape (how many photos the grid shows), swipe (what a finger's movement across the viewer means)
│   │   ├── photos/                 # photo-sources (the src, srcset, smallest and largest file of a photo from its widths)
│   │   ├── text/                   # fill-template, paragraphs, fill-markers (a part still to fill), table-of-contents
│   │   └── availability/           # KEPT, UNWIRED: iCal parsing (dates only), freshness, "unknown, never free"
│   │
│   ├── markdown/                   # BUILD TIME: Markdown page plugins for Sätteri (Astro's processor): fill-markers-plugin
│   │                               #   (a part to fill becomes a labelled box), page-structure-plugin (focusable headings, tables in
│   │                               #   a named scroll region); imports domain/ only (and Sätteri's types)
│   │
│   ├── server/                     # KEPT, UNWIRED: calendar source, fetch, cache, service (for a future admin view)
│   │
│   ├── components/                 # UI ONLY: markup, styles, DOM events; logic comes from domain/
│   │   ├── layout/   BaseLayout, SkipLink, SiteHeader (logo), SiteFooter, BackToTop + back-to-top.ts (the corner button that returns to the top)
│   │   ├── home/     HomeHero, HomePoints   # the home page's own parts
│   │   ├── cabin/    CabinGallery + gallery-controller.ts, cabin-photo.ts (content photo -> page photo), CabinFacts, CabinHighlights + highlight-icons.ts (the badges and their icons), JumpToRequest, ApartmentRow, ApartmentRows, MoreApartments (the home page's folded rows)
│   │   │             #   (the rows are shared by the home page and the apartment pages)
│   │   ├── legal/    LegalHead, LegalToc (sticky beside the text, folded <details> on a phone), DraftNotice,
│   │   │             #   CoordinatorCard (the accessibility coordinator, from config/site.ts)
│   │   ├── contact/  ContactDetails       # WhatsApp, phones, email (no map embed: L7)
│   │   ├── booking/  BookingRequest + request-controller.ts (the home page's request with an apartment choice, and
│   │   │             #   the apartment page's with the apartment fixed), BookingLinks + booking-links.ts,
│   │   │             #   BookingDates (the only date field), BookingGuests + GuestCounter (couples, children, total), BookingName, BookingNotice
│   │   └── ui/       Prose, UpdatedDate, HeartRule, Icon (+ icons/: the path data of the three icons and their licences)
│   │
│   ├── styles/       tokens.css (the logo's palette), fonts.css (@font-face), global.css
│   └── pages/        index, cabins/[id], [legal], 404, and the same three under en/     # ROUTES: thin files over components/pages
│
├── scripts/
│   ├── check-licenses.mjs          # licence allow-list over every installed package (C4)
│   ├── check-build-output.mjs      # no source maps, no secret, no foreign script in dist/ (S4, S13, L7)
│   ├── check-launch-ready.mjs      # no placeholder or leftover sample text left (L11, C3)
│   ├── brand/                      # the logo files (C3): ink-bounds (pure: where the drawing is on the page), build-logo (entry:
│   │                               #   npm run brand:build -- <the owner's logo file>, writes public/brand/)
│   ├── budget/                     # the performance budget: limits, page-weight + pick-candidate (pure; a srcset counts at what a phone loads), check-budget (entry)
│   ├── fonts/                      # the web fonts (C1): charset (Hebrew + Latin), fonts (the three), subset-fonts (entry:
│   │                               #   npm run fonts:build -- <folder of the full .ttf files>, writes public/fonts/)
│   └── photos/                     # the photo pipeline (C3, L8): limits, plan-variants, encode (sharp), output-path,
│                                   #   add-photo (entry); webp-chunks + photo-rules + check-photos (the check)
│
├── tests/
│   ├── unit/                       # domain/ and server/, scripts/, e2e/ (the test server)
│   ├── e2e/                        # browser tests (Playwright + axe) over dist/client, run by `npm run test:e2e`:
│   │   ├── server/                 #   a read-only static server that sends the real `_headers` (headers-file, serve-static, start)
│   │   ├── helpers/                #   built-pages, run-axe, page-problems, focus-obscured (2.4.11)
│   │   └── *.spec.ts               #   pages (every page x 2 widths), gallery (keyboard), gallery-frame (the viewer keeps its size), back-to-top, logo, checkers (the checks fail on bad pages)
│   └── policy/                     # rules as tests: layers, no-third-party + no raw HTML, headers, contrast,
│                                   #   no-public-availability
└── docs/                           # architecture, structure, compliance, roadmap, design/, archive/
```

## Layer rules

Who may import whom. `tests/policy/layers.test.ts` reads every import and fails on a breach.

| Layer          | May import                                                | Never                                            |
| -------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `domain/`      | `domain/`, `config/`                                      | `server/`, `components/`, any I/O                |
| `server/`      | `domain/`, `config/`                                      | `components/`, `pages/`                          |
| `markdown/`    | `domain/`, packages (Sätteri's types)                     | `components/`, `pages/`, `server/`, `i18n/`      |
| `components/`  | `domain/`, `config/`, `i18n/`, `components/`              | `server/`, the availability code                 |
| `pages/`       | `components/`, `config/`, `i18n/`, content                | `server/`, the availability code, API routes     |
| `i18n/`        | itself only                                               | every other layer                                |

`fetch` appears only in `server/` (and in a future `api-client/`). A browser-to-API layer (`api-client/`) comes back
only with a feature that needs one; its rule then is: it imports `domain/` only.

## File rules

- One responsibility per file; a file that needs "and" to describe it is split.
- Functions small and single-purpose; a function over ~30 lines is a sign to split it.
- Each exported function has a one-line comment (`/** ... */`) saying what it does, not how.
- English names; kebab-case for `.ts` files, PascalCase for `.astro` components.
- Pure functions in `domain/` and services in `server/` have unit tests in `tests/unit/`.
