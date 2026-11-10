import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { hasWifi, HIGHLIGHT_KINDS, missingEvidence } from './domain/apartments/highlights';

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
  /** The widths the photo script made (name-640.webp ...); `src` is one of them. Absent for a single-file photo (an SVG). */
  widths: z.array(z.number().int().positive()).min(1).optional(),
});

/** One badge of an apartment (Wi-Fi, a jacuzzi, a sauna...): a kind from the list, and a count for the kinds that can be many. */
const highlight = z.strictObject({
  kind: z.enum(HIGHLIGHT_KINDS),
  count: z.number().int().min(2).max(9).optional(),
});

/**
 * One cabin per file, all in the frontmatter: the file name is its id; the description's paragraphs are split by blank lines.
 * The badges (`highlights`) must include Wi-Fi (the owner's standing rule) and each must have its line in the features
 * text, in both languages, so a badge never claims what the owner's text does not (H1).
 */
const cabins = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cabins' }),
  schema: z
    .strictObject({
      name: text,
      order: z.number().int(),
      summary,
      description: text,
      maxGuests: z.number().int().min(1).max(20),
      bedrooms: z.number().int().min(0),
      bathrooms: z.number().int().min(1),
      highlights: z.array(highlight).min(1),
      features: z.array(text).min(1),
      photos: z.array(photo).min(1),
    })
    .superRefine((cabin, context) => {
      if (!hasWifi(cabin.highlights)) {
        context.addIssue({ code: 'custom', path: ['highlights'], message: 'every apartment lists Wi-Fi' });
      }
      for (const language of ['he', 'en'] as const) {
        const missing = missingEvidence(
          cabin.highlights,
          cabin.features.map((feature) => feature[language]),
          language,
        );
        if (missing.length > 0) {
          context.addIssue({
            code: 'custom',
            path: ['highlights'],
            message: `no line in the ${language} features for: ${missing.join(', ')}`,
          });
        }
      }
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
