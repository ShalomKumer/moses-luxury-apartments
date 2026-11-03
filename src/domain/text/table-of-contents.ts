/** A heading of a rendered page, as the content system reports it. */
export interface PageHeading {
  depth: number;
  slug: string;
  text: string;
}

/** A line of the table of contents. */
export interface TocEntry {
  slug: string;
  text: string;
}

/** A page with fewer sections than this gets no table of contents (docs/design/legal.md). */
export const MIN_TOC_SECTIONS = 3;

/** The table of contents of a page: its section headings (level 2), or nothing when there are too few to need one. */
export function tableOfContents(headings: PageHeading[]): TocEntry[] {
  const sections = headings.filter((heading) => heading.depth === 2).map(({ slug, text }) => ({ slug, text }));
  return sections.length >= MIN_TOC_SECTIONS ? sections : [];
}
