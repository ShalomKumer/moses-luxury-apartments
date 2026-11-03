import { describe, expect, it } from 'vitest';
import { tableOfContents, type PageHeading } from '../../../src/domain/text/table-of-contents';

const h = (depth: number, slug: string): PageHeading => ({ depth, slug, text: slug.toUpperCase() });

describe('tableOfContents', () => {
  it('gives nothing for no headings', () => {
    expect(tableOfContents([])).toEqual([]);
  });

  it('gives nothing for two sections', () => {
    expect(tableOfContents([h(2, 'a'), h(2, 'b')])).toEqual([]);
  });

  it('lists three sections in order', () => {
    expect(tableOfContents([h(2, 'a'), h(2, 'b'), h(2, 'c')])).toEqual([
      { slug: 'a', text: 'A' },
      { slug: 'b', text: 'B' },
      { slug: 'c', text: 'C' },
    ]);
  });

  it('leaves out headings that are not sections and does not count them', () => {
    expect(tableOfContents([h(1, 'x'), h(2, 'a'), h(3, 'y'), h(2, 'b')])).toEqual([]);
    expect(tableOfContents([h(2, 'a'), h(3, 'y'), h(2, 'b'), h(2, 'c')]).map((e) => e.slug)).toEqual(['a', 'b', 'c']);
  });
});
