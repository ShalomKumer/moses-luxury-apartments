import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A text in both languages. A cabin or a page missing one of them fails the build, so nothing ships half translated. */
const text = z.strictObject({ he: z.string().min(1), en: z.string().min(1) });

/** A one-line summary in both languages, each at most 160 characters. */
const summary = z.strictObject({ he: z.string().min(1).max(160), en: z.string().min(1).max(160) });

/** A photo of a cabin: a file of ours under /photos, with its alt text required in both languages (A2, C3). */
const photo = z.strictObject({
  src: z.string().regex(/^\/photos\/[a-z0-9-]+\/[a-z0-9-]+\.(jpg|jpeg|webp|png|svg)$/),
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** One cabin per file, all in the frontmatter: the file name is its id; the description's paragraphs are split by blank lines. */
const cabins = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cabins' }),
  schema: z.strictObject({
    name: text,
    order: z.number().int(),
    summary,
    description: text,
    maxGuests: z.number().int().min(1).max(20),
    bedrooms: z.number().int().min(0),
    features: z.array(text).min(1),
    photos: z.array(photo).min(1),
  }),
});

/** The legal and accessibility pages: one file per language, in legal/he and legal/en, with the same file names. */
const legal = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/legal' }),
  schema: z.strictObject({
    title: z.string().min(1),
    description: z.string().min(1),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    order: z.number().int(),
    /** While present the page is a draft: the words of the notice shown at its top (removed when the text is final). */
    draft: z.string().min(1).optional(),
    /** True on the accessibility statement: the coordinator's card is shown at its end (A6). */
    coordinator: z.boolean().optional(),
  }),
});

export const collections = { cabins, legal };
