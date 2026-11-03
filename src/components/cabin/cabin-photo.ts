import type { CollectionEntry } from 'astro:content';
import { photoSources } from '@domain/photos/photo-sources';
import type { Locale } from '@i18n/locales';
import { pick } from '@i18n/pick';

/** A cabin's photo as the pages draw it: the files, the alt text in the page's language and the size of the default file. */
export interface PagePhoto {
  src: string;
  srcset?: string;
  full: string;
  alt: string;
  width: number;
  height: number;
}

/** Turns a photo of the cabin content into what a page needs, in one language. */
export function toPagePhoto(photo: CollectionEntry<'cabins'>['data']['photos'][number], locale: Locale): PagePhoto {
  return {
    ...photoSources(photo.src, photo.widths),
    alt: pick(photo.alt, locale),
    width: photo.width,
    height: photo.height,
  };
}
