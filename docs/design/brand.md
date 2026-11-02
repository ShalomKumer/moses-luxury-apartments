# Brand: what the logo dictates

The owner's logo (sent by the user on 2026-10-31, kept as `docs/design/brand/logo-original.jpg`) sets the style of the
whole site: the user's rule, "from now on the logo dictates the UI/UX style". Palette and type below are read from it.
Status: **adopted for colours; type proposed and waiting for the user's yes to download the font files.**

## What the logo says

- Name: **דירת מוזס**, with **Moses Luxury Apartments** under it.
- Two lines in gold: **דירות יוקרה / בלב העיר העתיקה צפת**.
- Slogan, in handwriting: **חוויה של יוקרה, שלווה ונוף עוצר נשימה**.
- A gold roof with a four-pane window above the name, and a thin gold rule with a small heart.
- Black ink on white paper. The names are a brush script; the gold lines are a bold rounded sans.

**Decided for now (the user, 2026-11-02): the name stays as in the logo,** "דירת מוזס", and each unit is a "דירה"; the
explorations use it. Before that: the project and the first brief said "אחוזות מוזס" and "צימרים" (cabins); the logo says
"דירת מוזס" and "דירות יוקרה" (apartments) in the old city of Safed. `src/config/site.ts` now uses the logo's name and
lines, and the design exploration uses "דירות". The cabin files, the legal drafts and the page texts still say "צימר"
until they are renamed (mechanical, in the stage that builds the pages).

## Palette (measured from the file's pixels)

| Token (in `src/styles/tokens.css`) | Value | From | Used for |
| ---------------------------------- | ----- | ---- | -------- |
| `text`, `on-accent` | `#201f20` | the ink (median of the dark pixels) | text, the text on a gold button, the focus ring |
| `accent` | `#c9972c` | the roof | button fill, rules, ornaments, the bar above a card |
| `accent-hover` | `#d9ae4c` | the roof's lighter end | a hovered button |
| `link` | `#86601f` | the subtitle's gold, darkened | links and any gold text (5.7:1 on white) |
| `bg` / `surface` | `#faf8f3` / `#ffffff` | the paper | the page / cards and forms |
| `border` | `#8c867a` | a warm grey | the edge of a field (3.6:1) |

- **Gold is a fill and an ornament, never small text.** The logo's own subtitle gold is 4.0:1 on white and the roof gold
  is 2.7:1, so gold text uses the darker `link` bronze. A gold button carries ink text (6.2:1).
- Every pair is pinned in `tests/policy/contrast.test.ts` (4.5:1 text, 3:1 edges); the test passes with the new tokens.
- The focus ring is ink with a white halo, so it shows on a gold button and over a dark photo.
- Free / taken / unknown keep a green / red / grey that are not the brand's, on purpose: they mean something, and each is also
  told by text and pattern.
- **Light only.** The logo is black ink on white; on a dark surface it would vanish. The site has no dark theme unless the
  user asks and a reversed logo is supplied.

## Type (proposed; not in the code yet)

| Role | Face | Licence | Why |
| ---- | ---- | ------- | --- |
| Headings | Frank Ruhl Libre (500, 700) | SIL OFL | a refined Hebrew serif: quiet luxury, no imitation of the brush script |
| Body and UI | Heebo (400, 600, 700) | SIL OFL | legible at small sizes, the same weight as the gold lines of the logo |
| Slogan only | Gveret Levin | SIL OFL | handwriting, to echo the logo's script; used for one line, never for reading text |

Self-hosted with each licence text beside the file (C1); no font CDN (L7). The design exploration loads them from
Google Fonts because an exploration is not the site. **Downloading the three font files needs the user's yes** (the
files, their source and size are stated when asked). Until then the site uses the system's fonts.

## Shapes and details

- Corners 10 px on controls, 14 px on cards, 22 px on a large photo.
- The thin rule with a small heart, drawn in our own SVG after the logo's, under the heading of a section.
- A 4 px gold bar on top of the search card and the results box.
- The roof (a gold chevron with a small four-pane window) is the logo's mark; the favicon should be built from it once
  the owner sends the original vector file.

## The logo file

- The user's file is a 1055 x 1491 JPEG of the lockup on a large white page, no transparency. Cropped copies are in
  `public/brand/`: `logo-full.jpg` (everything) and `logo-name.jpg` (roof and both names, for the header).
- The header shows the JPEG with `mix-blend-mode: multiply`, so its white drops out on any light surface.
- **Ask the owner for the original** (SVG, PDF or a transparent PNG at a high resolution). A small JPEG blurs on a
  high-density phone and cannot be put on a photo. Row C3 records the file and the rights question.
- Rights: the logo is the owner's own mark, sent by the owner's representative. The owner confirms in writing that
  they hold the design files and the rights (a designer's licence, if one made it).

Iron rules touched: C1, C3, C6, A1, A3, L7, H1.
