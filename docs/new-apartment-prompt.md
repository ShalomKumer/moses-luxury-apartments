# Adding an apartment: the prompt

Copy the block below into the chat, fill the fields, and send it. It is one small feature on its own branch, so it follows
the feature lifecycle in `CLAUDE.md` (plan on Opus, "מאשר", build on Sonnet, review, `/ship`, the user merges).

## The prompt

```
הוסף דירה חדשה לאתר.

שם בעברית:
שם באנגלית:
תיקיית התמונות (נתיב מלא):

תיאור בעברית:
<הדבק כאן>

תיאור באנגלית:
<הדבק כאן>

תמונה ראשית (שם הקובץ):
תמונות משניות, 4 (שמות הקבצים, לפי הסדר):
שאר התמונות (שמות הקבצים, לפי הסדר, או "כל השאר" - ואז אבחר אני):

מספר אורחים מקסימלי:        (אם ריק: לפי מספר המיטות, ואשאל)
חדרי שינה:                   (אם ריק: מהטקסט)
מקום ברשימה:                 (אם ריק: אחרי הדירות האמיתיות הקיימות, לפני הדוגמאות)
הערות (למשל: להשמיט שורת טלפונים, בלי אימוג'ים, "בס״ד"):
```

## What each field does

- **Name and photo folder.** The id of the page is the English name in lower-case with hyphens (`atzulat-hakikar-b`), and the photos
  go to `public/photos/<id>/`. The folder under `צימרים/` is git-ignored, so the originals never enter the repo.
- **Descriptions.** Cut into paragraphs and a feature list; the emoji, the "Moses Luxury Apartments" line and the phone lines are left
  out (the site shows the contact details once, in the footer and beside the booking buttons). Nothing is added that the text does not
  say (H1): a word that only one language has ("private") is left out of both unless the owner confirms it.
- **Main photo.** The first photo of the apartment; it is the large one in the grid. On the home page the hero is the first apartment's
  first photo only.
- **Secondary photos.** The grid always shows the first five photos: the main one large and four small, so give four (the first
  five of the order you send). A grid of one large and three small happens only for an apartment with exactly four photos; a
  different arrangement for a longer set is a code change (`src/domain/gallery/gallery-shape.ts`), so ask for it in the plan.
  Prefer landscape photos here; a portrait photo is cropped badly in the grid.
- **The rest.** They are reached by "all photos" (the viewer) and, without JavaScript, by links named by their alt text. About ten photos
  in all keeps the page under its 1 MB ceiling on a phone; more is possible when the weight check still passes.

## What I do with it

1. Plan (on Opus): the folder structure, the photo order, the alt texts (each describes only what the photo shows), the open questions,
   the iron rules touched (C3, A2, H1).
2. Photos: every one through `npm run photos:add -- <file> <id> <name>` (WebP in widths 640, 1280, 1920, no EXIF or GPS, at most 250 KB
   a file); a portrait photo is left out unless asked for, because its 1920 file is very tall.
3. Content: `src/content/cabins/<id>.md` (name, order, summary, description, `maxGuests`, `bedrooms`, features, photos with alt in both
   languages). The orders of the sample apartments are moved up when needed.
4. Tests: one entry in the `APARTMENTS` table of `tests/e2e/real-apartments.spec.ts`; the "other apartments" count in
   `tests/e2e/apartment.spec.ts`; `npm run verify`.
5. Docs: one row per photo in `src/content/photos.md` (source and rights), the iron-rule rows C3 and H1, and `docs/roadmap.md`.
6. Review and `/ship` as in `CLAUDE.md`.

## What stays with the owner

The written confirmation that the photos are his or licensed to him (C3), the guest cap when it is not in the text, and the check-in
and check-out times (shown only when the owner gives them: `SITE` in `src/config/site.ts`).
