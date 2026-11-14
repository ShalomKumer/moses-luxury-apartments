/** One `<meta>` tag of a page's sharing card: Open Graph tags use `property`, Twitter/X tags use `name`. */
export interface ShareTag {
  attribute: 'property' | 'name';
  key: string;
  content: string;
}

/** The preview image of the site: an absolute address, its size, and its alternative text. */
export interface ShareImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/** What a page tells a chat app or a social network about itself. */
export interface ShareInput {
  locale: keyof typeof OG_LOCALES;
  siteName: string;
  title: string;
  description: string;
  /** The page's absolute address. */
  url: string;
  image: ShareImage;
}

/** The Open Graph name of each language of the site. */
const OG_LOCALES = { he: 'he_IL', en: 'en_US' } as const;

/**
 * Builds the sharing tags of a page (E2): Open Graph and a large-image Twitter/X card, with the page's own title, description
 * and address and the site's preview image. Only what the page really says: no rating, price, review or availability (H1, H2).
 */
export function buildShareTags(input: ShareInput): ShareTag[] {
  const og = (key: string, content: string): ShareTag => ({ attribute: 'property', key: `og:${key}`, content });
  const twitter = (key: string, content: string): ShareTag => ({ attribute: 'name', key: `twitter:${key}`, content });
  const others = (Object.keys(OG_LOCALES) as (keyof typeof OG_LOCALES)[]).filter((locale) => locale !== input.locale);
  return [
    og('type', 'website'),
    og('site_name', input.siteName),
    og('title', input.title),
    og('description', input.description),
    og('url', input.url),
    og('locale', OG_LOCALES[input.locale]),
    ...others.map((locale) => og('locale:alternate', OG_LOCALES[locale])),
    og('image', input.image.url),
    og('image:width', String(input.image.width)),
    og('image:height', String(input.image.height)),
    og('image:alt', input.image.alt),
    twitter('card', 'summary_large_image'),
    twitter('title', input.title),
    twitter('description', input.description),
    twitter('image', input.image.url),
    twitter('image:alt', input.image.alt),
  ];
}
