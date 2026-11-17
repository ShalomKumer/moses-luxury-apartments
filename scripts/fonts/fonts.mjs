// The three fonts of the site (docs/design/brand.md), all SIL Open Font License 1.1, from github.com/google/fonts.

export const FONTS = [
  // Headings: a refined Hebrew serif. A variable font; only the weights the design uses are kept.
  { file: 'FrankRuhlLibre', folder: 'frank-ruhl-libre', axes: { wght: { min: 500, max: 700 } } },
  // Body and interface text.
  { file: 'Heebo', folder: 'heebo', axes: { wght: { min: 400, max: 700 } } },
  // The slogan only: handwriting, never reading text.
  { file: 'GveretLevin', folder: 'gveret-levin', axes: null },
];
