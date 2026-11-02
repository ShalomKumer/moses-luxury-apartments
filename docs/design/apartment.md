# Apartment page: five layouts

Branch `feature/design-apartment-page` (stage 3). Status: **decided (2026-11-02): layout 1, gallery first, with the
phone jump button of layout 5 and the apartment rows of layout 2.** Docs only; nothing in `src/` changes until stage 4
builds the approved page.

The exploration is live HTML: `docs/design/explorations/apartment-layouts.html`, also published as an artifact (private,
shared by the user as needed): https://claude.ai/artifact/3xX4qkduVATPkZ6sDxQEQS. A tab per layout and a comparison tab;
a phone-frame toggle, an English (left to right) toggle, and a "state to check" menu (five photos, one photo, a long
name, a past check-in date). Every photo opens the photo viewer.

## Assumptions (no questionnaire)

- **The name stays as in the logo for now** (the user, 2026-11-02: "תשאיר כרגע דירות מוזס"): "דירת מוזס / Moses Luxury
  Apartments", and each unit is a "דירה". The sample apartment is `gefen.md` renamed "דירת הגפן"; its texts and facts are
  the file's sample content, labelled as sample (H1, H2).
- **The page's purpose:** a guest who came from the home page decides whether this apartment fits and sends a request.
  So the order is photos, then the facts, then the request, with the request always close to the facts.
- **The language is the home page's** (`home.md`, "Decision"): ink, the logo's gold as a fill, white paper; Frank Ruhl
  Libre headings, Heebo text, Gveret Levin for the slogan only; the request card with its gold edge; the heart rule
  under a heading. The five vary the layout inside it, as `CLAUDE.md` ("Design") asks from the second page on.
- **The request on this page names the apartment** and has no apartment choice: check-in, check-out, guests (up to the
  apartment's `maxGuests`), the message it will open, the WhatsApp and email buttons, and the notice with the policy
  links and the minimum age (L5, L10, H4). The dates only write the message; a past or reversed date shows a note and
  is left out of it. No availability is shown (`no-public-availability.test.ts`).
- The photos are our own drawn sample scenes, never photos; the real ones come through the photo script (C3, rule 2).
- The other apartments appear under the page, so a guest who does not like this one is not sent back to the start.

## The five layouts

| # | Name | Structure | Memorable element | Cost |
| - | ---- | --------- | ----------------- | ---- |
| 1 | Gallery first | Title, a grid of one large and four small photos with "all photos", then the details beside a request card that stays in view | The 1 + 4 grid | Needs about five good photos to look its best; shrinks cleanly to one |
| 2 | Full bleed | The home page's full-width photo with the name on a scrim, the request as a bar on its edge, a strip of photos, details in two columns | Continuity with the home page | The request sits above the details; text over a photo needs the scrim |
| 3 | Story | A large serif title and the slogan, one wide photo, chapters of photo and text, the request closing the story; a stuck "go to the request" button on a phone | The magazine chapters | Needs real text and a photo per chapter; the longest page |
| 4 | Split | The photos run down one side; the title, the facts and the request card stay in view on the other | The column that stays | The stuck side must be shorter than the screen; on a 768 px high laptop the card's buttons fall below it |
| 5 | Fact sheet | One photo at a time with previous and next, the facts as a table, a bar of actions fixed to the bottom (WhatsApp, call, email) | The action bar | No date fields, so the first message carries less; the least luxurious |

All five share the palette, the type, the buttons (gold primary, ink-outlined secondary, 44 px), the request card and
the contact area; the differences are structure, density, where the photos sit and the one memorable element.

## Comparison (scores 1-10, an estimate, not a measurement)

| Layout | Usability | Aesthetics | Accessibility | Fit to the product | Performance | Maintainability | Total (of 60) |
| ------ | --------- | ---------- | ------------- | ------------------ | ----------- | --------------- | ------------- |
| **1 Gallery first** | 9 | 8 | 9 | 9 | 8 | 8 | **51** |
| 2 Full bleed | 8 | 9 | 8 | 9 | 7 | 8 | 49 |
| 3 Story | 6 | 9 | 8 | 6 | 6 | 6 | 41 |
| 4 Split | 7 | 8 | 7 | 7 | 7 | 6 | 42 |
| 5 Fact sheet | 8 | 6 | 8 | 6 | 9 | 9 | 46 |

## Recommendation: 1, gallery first

1. **The order in which a guest decides.** Photos first, then the facts, with the request always beside them. On the
   home page the job is the impression; here it is the decision.
2. **It works with any number of photos.** The grid goes from five to one without breaking, and the owner has not sent
   photos yet.
3. **The same request card as the home page,** without the apartment choice, so the code stage 4 writes for the home
   page serves this page too.

**What to take from the others:**
- From 5: on a phone, a button stuck to the bottom that jumps to the request card, because there the card falls below
  the details.
- From 2: the other apartments as the home page's alternating rows instead of cards, so the two pages read as one site.

## Design critique (the `design-critique` skill, 2026-11-02)

- **First look:** in 1, 2 and 4 the eye lands on the main photo, then the name: right for this page. In 3 the title
  wins, then the photo; in 5 the bar at the bottom competes with the photo.
- **Usability:** the request is reachable without scrolling back in 1 and 4 (desktop) and through the stuck button in 3
  and 5. In 2 a guest who reads to the end must scroll back up. In 4 a stuck side taller than the screen hides the
  card's buttons (a moderate finding; it would need the side to stop sticking on short screens).
- **Hierarchy:** one primary action per view (the gold WhatsApp button); email is secondary. The message preview and the
  notice make the card tall; on a phone in 2 the bar comes before any photo but one. Keep the preview, it tells the
  guest what will be sent (8.2, "visible feedback").
- **Consistency:** palette, type, buttons and the card are the home page's in all five. 1's cards for the other
  apartments differ from the home page's rows (taken from 2 above).
- **Copy:** buttons say what they do and where they lead; the apartment's name is in every hidden label.

## Accessibility check (the `accessibility-review` skill and axe, 2026-11-02)

- **axe** (WCAG 2.0 to 2.2, A and AA) over every layout and the photo viewer, at 1280 px and 375 px, Hebrew and English:
  **no violations** after one fix. The fix: the stuck bars of 3 and 5 could rise over the header's links when the page
  starts low on a phone (2.5.8, target size); each bar now lives in the block below the title, so it can never cover a
  link above it.
- **Keyboard:** every photo is a button named "enlarge photo 2 of 5: <what it shows>"; the viewer is a native modal
  dialog, opens with focus on "close", the arrows step through the photos (mirrored for English), Escape closes it,
  and focus returns to the photo that opened it. The carousel of 5 has "previous" and "next" buttons with a live count.
- **Errors:** a past or reversed date shows a note in words (3.3.1), marks the field `aria-invalid` and is announced
  (`role="alert"`); the date fields point at the note with `aria-describedby`.
- **Direction:** one layout serves right to left and left to right (logical properties; the back and next arrows flip).
- **For the build (stage 4):** any bar stuck to the bottom needs `scroll-padding-bottom` on the page so a focused
  element is never hidden under it (2.4.11; the browser tests check it); the viewer's arrows and focus return get a
  browser test; a screen-reader pass stays in stage 7.

## States drawn

- Five photos; one photo (the grid, the strip and the carousel give way to one photo, "all photos" and the arrows go).
- A long name (wraps in the title, the viewer and the message; no sideways scroll at 375 px).
- A past check-in date (the note, the red edge, the date left out of the message).
- The photo viewer, opened from any photo.
- English, left to right.
- A phone width (the toggle, and checked at 375 px).

Not drawn here, because the page has none: loading, empty and error states of data (the page is static).

## Decision (the user, 2026-11-02)

**Layout 1, gallery first, as recommended, with what was taken from 5 and 2.** The first tab of the artifact
("✓ הנבחר") shows the combination.

**The page, from the top:**
1. Header: the logo, the two links, the language switch (the home page's).
2. "All apartments", the apartment's name (h1) and its summary.
3. **The gallery:** one large photo and four small ones (with fewer photos the grid shrinks: 3 is one large and two,
   2 is two halves, 1 is one), and "all photos (n)" on its edge. Every photo opens the photo viewer. On a phone, the
   first photo with the button.
4. **Two columns:** the details ("about the apartment", then "what it has": guests, bedrooms, the features) and, beside
   them, the **request card** that stays in view while the details scroll. On a phone, one column: the details, then
   the card, and a button stuck to the bottom under the details that jumps to the card's first field (from 5).
5. **More apartments** as the home page's alternating rows (from 2), then the contact area.

**Rules for the build (stage 4):**
- The request card is the home page's card without the apartment choice; its message names the apartment, and its
  guests run up to the apartment's `maxGuests` (`buildBookingMessage` takes the name, as `home.md` says).
- The gallery reads `photos` from the apartment's file in order; the first is the large one. The photos come through
  the photo script, 3:2, with `alt` from the file (A2, C3).
- The photo viewer is a native modal `<dialog>`: focus on "close" when it opens, the arrows step (mirrored in English),
  Escape closes, focus returns to the photo that opened it; a browser test walks it by keyboard (the existing
  `gallery.spec.ts` grows to it).
- The stuck card (desktop) and the stuck jump button (phone) need `scroll-padding` on the page so a focused element is
  never hidden under them (2.4.11); the focus-not-obscured browser test covers the page.
- Logical properties only, so the same CSS serves Hebrew and English.
- States to build and test: five photos, one photo, a long name, an invalid date (the note), English, 375 px.

**Not taken:** the full-bleed hero of 2, the chapters of 3, the stuck column of 4 and the action bar of 5.

## Open for the user

- Children and infants as a separate guests field: not assumed (as on the home page).

Iron rules touched: H1, H2, C3, C5, C6, A1, A3, A4, L5, L7, L10, H4.
