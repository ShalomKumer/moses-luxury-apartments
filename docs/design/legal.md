# Legal pages and the 404 page: one layout

Branch `feature/design-legal-pages` (stage 3). Status: **approved by the user (2026-11-02).** Docs only; nothing in `src/`
changes until stage 4 builds the approved pages.

The exploration is live HTML: `docs/design/explorations/legal-layouts.html`, also published as an artifact (private,
shared by the user as needed): https://claude.ai/artifact/MyeLVWBnycjjqe8hopWiW4. A tab per page (privacy, terms,
cancellation, accessibility, 404); a phone-frame toggle, an English (left to right) toggle, and a "state to check" menu
(draft as today, without the draft notice, a long title, the cancellation-fees table as a structure only).

## Why one layout, not five

`CLAUDE.md` ("Design") asks for five layouts for the first page of each kind. These are text pages: what decides them
is reading, and the language (type, palette, the heart rule, the header and footer) is already approved on the home and
apartment pages. The user approved one layout with all its states in the plan (2026-11-02, "מאשר").

## Assumptions (no questionnaire)

- **The texts are the drafts already on the site** (`src/content/legal/he` and `/en`), word for word. The final wording
  is the lawyer's (L1, L2, L3, H4, A6, L12); nothing here writes legal text.
- **A part still to fill stays visible** until it is filled: `npm run launch:check` fails while any `[למילוי` or
  `[TO FILL` is left (L11), so the design shows how such a part looks rather than hiding it.
- **The 404 page is one file for every missing address**, in both languages, as today (`src/pages/404.astro`): the host
  serves the same file, so each block declares its own language and direction (A7, S4).
- The name stays as in the logo for now ("דירת מוזס", units are "דירות"; the user, 2026-11-02).

## The layout

1. Header: the logo and the two links (the home page's), with the skip link before it (shown on focus).
2. **The page head** on the paper tone: the title (h1), the heart rule, one sentence on what the page holds (the
   file's `description`), and "Last updated" with a `<time>`.
3. **Two columns on a desktop:** the table of contents ("On this page", numbered, a gold edge on its start side) stays
   in view beside the text; the text column is at most 66 characters wide, 16.5 px, line height 1.75. Each section
   heading has a short gold bar under it (lighter than the heart rule, which the page head keeps).
   **On a phone:** one column, and the table of contents is a folded `<details>` above the text, with a chevron that
   turns when it opens.
4. **The draft notice**: a box with an ink edge, a pen icon and the word "Draft." first; never colour alone.
5. **A part still to fill**: a dashed box that starts with the word "To fill:" (bold); the word carries the meaning, the
   dashes only point to it (1.4.1).
6. **The accessibility coordinator** is a card (name, phone, email, the date of the last check) at the end of the
   accessibility statement, because it is what a visitor of that page comes to find.
7. **The footer**: the business details (name, number, address, phone and email) and "Information and policies", the
   four policies with the current one marked (`aria-current="page"`, bold, a gold bar; not colour alone).

**404:** the header, then the Hebrew block and the English block, each with a large "404" (hidden from screen readers,
the dark gold that passes 3:1 as large text), its h1, one sentence, and two ways on: "Back to the home page" (primary)
and "All apartments" (secondary); then the footer.

## States drawn

- Draft (today): the draft notice and the parts still to fill.
- Without the draft notice (what a final page looks like once the lawyer's text is in).
- A long title (wraps in two lines or more, balanced, at most 24 characters a line on a desktop).
- The cancellation-fees table, **structure only** (when you cancel, the fee, the refund; every value still to fill):
  it scrolls inside its own focusable box on a phone and never moves the page sideways.
- A page with three sections or more gets the table of contents; a shorter one does not (the rule for the build).
- English, left to right; a phone width (the toggle, and checked at 375 px).

Not drawn, because the pages have none: loading, empty and error states of data (the pages are static).

## Design critique (the `design-critique` skill, 2026-11-02)

- **First look:** the title, then the draft notice: right for a draft. Once the notice goes, the title and the date.
- **Usability:** the table of contents takes a visitor straight to "cancellation fees" or "the coordinator"; on a phone
  it costs one row while folded. The footer shows where the visitor is among the four policies.
- **Hierarchy:** the parts still to fill are the loudest thing in the text, on purpose: they block launch. In the terms
  page three of six sections are only a part to fill, so the page looks unfinished until the lawyer's text arrives.
- **Consistency:** palette, type, header and the heart rule are the home and apartment pages'. Section headings use a
  short gold bar instead of the heart, so a long text page does not repeat the ornament six times.
- **A content finding (not a design one):** the Hebrew terms and accessibility texts say "צימרים" where the name is
  now "דירות" (the English already says "apartments"). It is fixed in the content, in stage 4 or 5, not here.

## Accessibility check (the `accessibility-review` skill and axe, 2026-11-02)

- **axe** (WCAG 2.0 to 2.2, A and AA) over every page in every state, at 1280 px and 375 px, Hebrew and English (80
  runs): **no violations** after one fix, and no sideways scroll. The fix: the large "404" was in the logo's fill gold
  (below 3:1); it is now the dark gold.
- **Keyboard:** the skip link appears on focus and moves focus to the h1; a table-of-contents link moves focus to its
  section heading (both checked by a script). The folded table of contents is a native `<details>` (Enter and Space).
- **Structure:** one h1 per page (the 404 has one per language block, each with its own `lang` and `dir`), h2 per
  section, the table of contents in a named `<nav>`, the footer's two parts named by their headings, the table with a
  caption and column headers, the draft notice `role="note"`.
- **Not checked here:** a screen reader (stage 7), reflow at 320 px and 200% zoom (the browser tests of stage 4).

## Rules for the build (stage 4)

- `LegalPage.astro` grows the page head (title, the heart rule, `description`, `UpdatedDate`), the table of contents
  (from the headings of the rendered entry; shown when there are three or more), the draft notice and the two-column
  body. The draft notice comes from the entry's front matter (a `draft` field) instead of a blockquote in the text.
- A part still to fill is marked by one small, tested function that turns `[למילוי: ...]` and `[TO FILL: ...]` into the
  dashed box; `launch:check` stays the guard that none reaches production.
- The coordinator card is a component fed from `src/config/site.ts`, not written in the Markdown, so the same details
  appear wherever they are needed.
- The sticky table of contents needs nothing over the text (it sits beside it); headings get `scroll-margin-top` so a
  linked heading is not cut at the top.
- The footer marks the current policy with `aria-current="page"`.
- 404 keeps its two language blocks and gains the second way on ("All apartments") and the large number.
- Logical properties only, so the same CSS serves Hebrew and English.
- States to build and test: draft, without the notice, a long title, the table at 375 px, English, 375 px.

## Decision

**Approved by the user (2026-11-02, "מאשר"): the one reading layout as drawn**, with its states and the rules for the
build above. Open: the "צימרים" wording in the Hebrew texts (a content fix, above).

Iron rules touched: L1, L2, L3, L10, L11, H1, H4, A1, A4, A6, A7, S4, C5, C6.

## Built (feature/build-legal-pages, 2026-11-03)

All seven parts of the layout and the 404 page are built as drawn, in Hebrew and English, with the rules above.

- **Where:** `src/components/legal/` (`LegalHead`, `LegalToc`, `DraftNotice`, `CoordinatorCard`), `LegalPage.astro`, the
  footer's `aria-current`, `src/pages/404.astro`.
- **The table of contents** comes from the headings the content system reports (`tableOfContents`, three sections or
  more); both versions (the sticky list and the folded `<details>`) are in the page and CSS shows one, so no script runs.
- **The draft notice** is the `draft` field of a page's front matter (its own words), no longer a blockquote; removing
  the field is what makes a page final, and `launch:check` fails while it is there.
- **A part to fill** is made by `src/markdown/fill-markers-plugin.ts` (Sätteri, Astro 7's Markdown processor; the
  unified `rehypePlugins` need an extra package and are not used). The same plugin file set makes each section heading
  focusable and wraps a table in a named, keyboard-reachable scroll region with a caption (`page-structure-plugin.ts`).
- **The coordinator card** reads `SITE.accessibilityCoordinator` (`src/config/site.ts`); a null is a part to fill.
- **The cancellation-fees table** is a structure only (three columns, three rows, every cell to fill) until the lawyer
  writes it.
- **The wording** "צימרים" is "דירות" in the Hebrew terms and accessibility texts.
- **Tested:** `tests/e2e/legal.spec.ts` (both languages, both widths), `tests/unit` for the markers, the table of
  contents and the two plugins; axe, overflow and focus for every page are in `pages.spec.ts`.
- **Not done here:** the footer's business details are still the dictionary's placeholders (L11, stage 5); the table's
  figures and every legal sentence are the lawyer's (L1, L2, L3, H4, A6, L12).
