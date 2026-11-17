# Screen-reader check

The pass that axe cannot do (axe finds about a third of the problems, `docs/standards.md` section 8): a person listens to the site with a screen reader.
Before the launch (A5, stage 7). Every finding is fixed in the same change that finds it, and written under "Findings" below with the date.

## What to use

- **Windows:** NVDA (free) with Firefox or Chrome. Insert + Space toggles browse and focus mode; H moves by headings, D by landmarks, K by links, B by buttons, F by form fields, G by images.
- **A phone:** VoiceOver on an iPhone with Safari (swipe right to read on, double tap to activate), and TalkBack on Android if there is one.
- **Hebrew voice:** install one (NVDA: a Hebrew synthesizer; iPhone: a Hebrew voice). Without it the Hebrew pages are heard in a foreign accent and nothing can be judged.
- Do the Hebrew pages (`/`) and the English pages (`/en/`) in their own voice; the language of each page must be announced right (`lang` and `dir`).

## For every page

1. The page title is announced and says where you are.
2. The first Tab lands on "skip to content"; Enter moves the reading to the main content.
3. Landmarks (D): a header, a navigation, one main, a footer. Nothing important sits outside them.
4. Headings (H): one `h1`, then a sensible order with no jump. Read only the headings: they should tell what the page holds.
5. Every link says where it goes without its surroundings (K list: no "click here", two links with the same name go to the same place).
6. Every button says what it does (B list); a button that only shows an icon has a name.
7. Every image (G): a photo of an apartment has a description that says what is in it; a decoration is silent.
8. Tab through the whole page with the screen reader on: nothing is skipped, nothing is announced twice, focus is always on something visible.
9. Zoom to 200% and turn off the images: the page still reads in the same order.

## Page by page

| Page | What to do, and what you should hear |
| ---- | ------------------------------------ |
| Home, Hebrew and English | The language switch says which language it leads to. The apartment cards read as a list, and each card says the name and what is special about it. The contact section reads the phone and the email as links. |
| An apartment page (try one with a jacuzzi and one without) | The gallery: each photo's button says its place in the set and what the photo shows. In the viewer (a dialog): focus moves inside it, the arrows and Escape work, the position is announced as it changes, Escape returns focus to the photo that opened it. The facts (guests, beds, features) read as a list. |
| The booking panel | The date picker: open it with Enter, move by days with the arrows, the day, month and year are announced, and a day that cannot be chosen is not offered as if it could. The guests counters, the flexibility chips and the optional name field have labels, and the limits of the counters are said. The WhatsApp and email buttons say what they do and that they open another app. The total is announced when it changes. |
| The language offer (when it shows) | It is announced without stealing focus; closing it returns the reading to where it was. |
| The back-to-top button | It appears only after scrolling, has a name, and Enter returns the reading to the top. |
| The legal pages (privacy, terms, cancellation, accessibility) | The table of contents jumps to the right heading. Long tables are read by cell with their headers. A draft notice is read first. |
| The accessibility statement | The coordinator's name, phone and email are read as links. |
| The 404 page | It says what happened and the two ways on (home and the language's home), in the page's language. |

## Findings

| Date | Page | What was heard | Fix (branch) |
| ---- | ---- | -------------- | ------------ |
| | | | |

A pass with nothing written under "Findings" is not a pass that found nothing: write "checked on <date> with <reader> and <browser>, nothing found" in the table.

Iron rules: A1 to A7 (accessibility; the accessibility statement, A6, must say only what was tested).
