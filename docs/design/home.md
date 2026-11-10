# Home page: five layouts

Branch `feature/design-home` (stage 2). Status: **decided (2026-10-31): the top of layout 2 and the bottom of layout 3.** Docs only; nothing in
`src/` changes until the stage that builds the approved page.

The exploration is live HTML: `docs/design/explorations/home-layouts.html`, also published as an artifact (private, shared
by the user as needed): https://claude.ai/artifact/Est9VWPtsFbUxHLSr9uisY. A tab per layout, a desktop and a phone frame.
The request card works: choosing an apartment or the number of guests changes the message it shows in every layout.

## How the brief changed (all 2026-10-31)

1. The user asked for a home page arranged like the discovery page of a large lodging site: a big photo with a date
   search on it, and more options below. **Layout only** (rule C6): nothing of that site's logo, colours, font, icons,
   photos or words is used.
2. The user sent the owner's logo, which dictates the style (`docs/design/brand.md`): ink black, the logo's gold, white
   paper; headings in a serif, the slogan in handwriting; the logo in the header and the contact area; the sample scenes
   are stone houses of an old town. Names are "דירה" in the exploration (the logo says apartments; open in `brand.md`).
3. The user removed availability and the date search from the site, for visitors and for the owner, and chose a
   **booking-request card** for the hero. The five layouts were redrawn: no dates, no results, no free/taken marks.
   Layout 5 changed its memorable element from the 14-night strip to a fixed action bar.

## Assumptions (no questionnaire)

- The site shows no availability to anyone, so there is no date field, no result and no free/taken mark (enforced by
  `tests/policy/no-public-availability.test.ts`).
- The request card has: which apartment ("any apartment, I'd like an offer" by default), **a check-in and a check-out
  date** (added at the user's request, 2026-10-31, in layouts 1 to 4), the number of guests, the message that will open
  (shown to the guest; the dates enter it only when they are valid), a WhatsApp button and an email button, and
  the notice with the policy links and the minimum age (L5, L10, H4). It is a group of controls, not a form: nothing is
  submitted to the site.
- When the card is built, `tests/policy/no-public-availability.test.ts` is narrowed in the same change: a date field is
  allowed only inside the booking-request card and never next to a calendar grid, a result or any free/taken wording.
  The dates only write the message; invalid ones (past, or a check-out not after the check-in) show a short note and are
  left out of the message.
- The message on the home page has no apartment unless one is chosen: "שלום, אשמח לבדוק זמינות והזמנה." The cabin page's
  message names the apartment. (`buildBookingMessage` takes an optional name when this is built.)
- The three points under the photo are written from what the site really does. The first (the old city of Safed) is
  from the logo's own words, to confirm with the owner. The third is a placeholder, shown dashed, until the owner gives
  a true one (H1).
- Booking stays a WhatsApp or email request with a ready message; nothing is sent from the home page itself.
- Business phones and email are the ones the user gave (`src/config/site.ts`). Booking messages go to 054-549-9445; the
  second number (053-436-9490) is listed for calls until the user says whether it also has WhatsApp.

## The five layouts

| # | Name | Structure | Memorable element | Cost |
| - | ---- | --------- | ----------------- | ---- |
| 1 | Floating card | Rounded photo, the request card overlapping its edge; on a phone the card drops below the photo | The card | Plain; the safest on a phone |
| 2 | Full bleed | Photo across the whole width, the logo's two lines over it, the request as a horizontal bar at its bottom; apartments in a sideways rail | The photo | Needs a scrim for readable text over any photo |
| 3 | Mosaic | Three photos, the request straddling their edge; apartments as large alternating rows | The magazine rows | Needs three good photos before it looks good |
| 4 | Split | Text and the request on one side, a tall photo on the other; a dense list with a WhatsApp button in every row | The per-apartment button | The photo is the smallest of the five |
| 5 | Fixed action bar | Photo and slogan, the three apartments overlapping its edge, no card; a bar fixed to the bottom of the screen (WhatsApp, call, email) | The bar | The simplest, and the least "form"; the guest chooses nothing before the message opens |

## Accessibility notes that hold for all five

- Every control has a visible label; the selects work from the keyboard (A3). The message preview is announced when it
  changes.
- Buttons say what they do and where they lead ("שליחת בקשה בוואטסאפ (נפתח בוואטסאפ)"), and name the apartment where
  there are several (A4).
- Photos carry a label; in the real site each carries `alt` from the cabin file (A2).
- Text over a photo sits on a scrim; gold is a fill, never small text (A1, `brand.md`).
- The fixed bar of layout 5 does not cover content: it sits in the page's flow at the end and sticks to the bottom
  while the page is in view; its buttons are 44 px; it is a labelled group (A3).
- The frame works at 390 px, and nothing scrolls sideways except layout 2's rail inside its own container.

## Decision (the user, 2026-10-31)

**The top of layout 2 (full bleed) and the bottom of layout 3 (mosaic).** The first tab of the artifact shows the combination.

**The page, from the top:**
1. Header: the logo, the two links, the language switch.
2. **Hero (layout 2):** a photo across the full width, about 580 px high on a desktop and 700 px on a phone; the logo's two
   lines over it (the tagline as the heading, the slogan in handwriting) on a scrim; the **booking-request bar** at its
   bottom: which apartment, check-in, check-out, guests, a WhatsApp button and an email button, the message that will
   open, and the notice with the policy links and the minimum age.
3. **The apartments (layout 3's lower part):** each apartment as a large row, photo (3:2) beside its name, summary,
   capacity and a "details and booking" button, the rows alternating sides.
4. The three points (the third still a placeholder).
5. Contact: the full logo, the slogan, WhatsApp, the two phones, the email.

**Not taken:** layout 3's three-photo mosaic hero and layout 2's sideways rail of apartments.

**Rules for the build:**
- Left to right (English) and right to left (Hebrew) from the same CSS: logical properties only (a test enforces it); the
  alternating rows alternate by the start and end side, so they swap automatically.
- The hero needs **one strong, wide photo** (the owner's, with rights confirmed: C3) and each apartment one 3:2 photo;
  a hero photo is at most about 250 KB through the photo script (`CLAUDE.md`, rule 2).
- Over a photo, text always sits on the scrim and the bar is on a white surface (A1).
- The bar's dates only write the message; `no-public-availability.test.ts` is narrowed in the same change (see the
  assumptions above).
- The apartments' row replaces `CabinCard` on the home page; `CabinCard` stays only if another page needs it.
- States to draw before it ships: the bar with an invalid date (the note), a phone width (a stacked bar), the English page.

## Built (`feature/build-home`, 2026-11-02)

The code follows the decision above. Where it differs from the drawing, or the drawing was silent:

- **The plate.** Text over the photo sits on a dark plate (`--color-scrim` at `--scrim-strength`, 66%) that fades in from the
  photo and is solid under the heading, the slogan and the bar; `contrast.test.ts` pins white on that plate at 4.5:1 even
  over a pure white photo. The bar itself is a white card (A1).
- **Changed 2026-11-10 (the user's list of ten, items 2 and 3):** the guests select is replaced by **couples**, **children** and a **total**. Each counter has "-" and "+" buttons and a field the guest can type in (digits only); a couple is two people and each child is one; the total is worked out from the two, shows empty while both are 0, and can be typed over (the guest's own number stays until a counter changes). Every number stays within the apartment's guests (couples first, children take what is left; a number too high is lowered with a short note). A **name** field (optional, at most 60 characters) adds a "Name:" line to the message; what is typed goes into the message only and is not stored. The message then reads: greeting, name, dates, "guests: 5 (2 couples, 1 child)".
- **Guests start as "not chosen"**, not 1, so the message claims no number the guest did not pick. The options follow
  the chosen apartment's capacity (more than it takes are disabled; a number already too high resets).
- **The hero is taller on a desktop** (50 rem, not 580 px): the bar with its message preview and notice is about 300 px
  high, and a lower hero would leave almost no photo. The hero photo is the cover of the first apartment (since 2026-11-03 the Artist's Estate's terrace at sunset, with a `srcset`); the sample drawing `hero.svg` is gone.
- **`ApartmentRow` replaced `CabinCard`** (deleted: nothing else used it). The contact area gained the full logo, the
  slogan and the heart rule. The three points use a real `h2` each, so the page's outline stays flat.
- **A date problem** shows a short note (`role="alert"`) and the date stays out of the message: a check-in in the past
  drops both dates; a check-out on or before the check-in drops only the check-out (`stay-dates.ts`, tested).
- Checked in Hebrew and English, at 1280 px and 375 px: axe, no sideways scroll, rows alternate by the text direction.
- **Changed 2026-11-08 (approved by the user, `feature/home-show-more`): the list shows the first five apartments, the rest sit folded.**
  Why: every apartment added about 70 KB to the home page's first load on a phone (415 KB with five), so it would have passed
  the 1 MB ceiling at about the thirteenth of the owner's sixteen. A quiet pill (a 1 px outline in the border colour, muted text, a chevron) between two hairlines, below the fifth row:
  "Show N more apartments" (one: "Show one more apartment"), opens a native `<details>` with the other rows, drawn like the first
  ones and continuing their alternation; open, the same pill says "Hide the other apartments" and its chevron turns up. The user
  first saw a full-width bordered button and asked for something gentler and for five rows by default (2026-11-08). No script: it opens by a click, Enter
  or Space, works without JavaScript and is found by the browser's search. The folded rows' photos are lazy, so none is fetched
  until it is opened, and the page-weight check does not count a lazy image folded in a closed `<details>`. The number shown is
  `ROWS_SHOWN` in `HomePage.astro`; with five apartments nothing is folded yet, the fold appears with the sixth. Considered and not chosen: a JavaScript button (heavier without JS), a separate "all apartments"
  page, smaller rows, and changing only how the weight is measured.

## Open for the user

- The layout is drawn right to left. The site is now also in English (left to right): the chosen layout is checked in both
  directions when it is built; a layout that depends on the card sitting at the "right" must use the start side instead.

- Which layout.
- The third point under the photo (a true, specific thing about the property, from the owner), and the first one (the
  old city of Safed) confirmed.
- Children and infants as a separate guests field: not assumed.
- The name and the words: "דירת מוזס / דירות" or "אחוזות מוזס / צימרים" (`brand.md`).

Iron rules touched: H1, H2, C3, C5, C6, A1, A3, A4, L5, L7, L10, H4.
