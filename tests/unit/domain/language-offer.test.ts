import { describe, expect, it } from 'vitest';
import { isExternalEntry } from '@domain/language/external-entry';
import { languageToOffer } from '@domain/language/suggest-language';

describe('which language to offer', () => {
  it('offers English on a Hebrew page to a browser that prefers English', () => {
    expect(languageToOffer('he', ['en-US', 'en'])).toBe('en');
    expect(languageToOffer('he', ['en'])).toBe('en');
  });

  it('offers Hebrew on an English page to a browser that prefers Hebrew, old code "iw" included', () => {
    expect(languageToOffer('en', ['he-IL', 'he', 'en-US'])).toBe('he');
    expect(languageToOffer('en', ['iw'])).toBe('he');
    expect(languageToOffer('en', ['IW-IL'])).toBe('he');
  });

  it('offers nothing when the page is already in the language the browser prefers first', () => {
    expect(languageToOffer('he', ['he-IL', 'en-US'])).toBeNull();
    expect(languageToOffer('en', ['en-GB', 'he'])).toBeNull();
  });

  it('follows the order of preference, not what the list contains', () => {
    expect(languageToOffer('he', ['en-US', 'he'])).toBe('en');
    expect(languageToOffer('en', ['he', 'en-US'])).toBe('he');
  });

  it('skips languages the site is not written in and takes the first of the two it is', () => {
    expect(languageToOffer('he', ['fr-FR', 'en-US'])).toBe('en');
    expect(languageToOffer('en', ['fr-FR', 'he'])).toBe('he');
  });

  it('offers English on a Hebrew page, and nothing on an English one, to a browser with neither language', () => {
    expect(languageToOffer('he', ['fr-FR', 'de'])).toBe('en');
    expect(languageToOffer('en', ['fr-FR', 'de'])).toBeNull();
  });

  it('offers nothing when the browser tells nothing', () => {
    expect(languageToOffer('he', [])).toBeNull();
    expect(languageToOffer('en', [])).toBeNull();
    expect(languageToOffer('he', ['', '  '])).toBeNull();
  });

  it('reads tags written in odd ways, and ignores values that are not text', () => {
    expect(languageToOffer('he', [' EN_us '])).toBe('en');
    expect(languageToOffer('en', ['he_IL'])).toBe('he');
    expect(languageToOffer('he', [undefined, null, 5, 'en'])).toBe('en');
    expect(languageToOffer('he', [undefined, null, 5])).toBeNull();
  });
});

describe('arriving from outside the site', () => {
  const ownOrigin = 'https://example.com';

  it('counts a new visit from another site', () => {
    expect(isExternalEntry({ navigationType: 'navigate', referrer: 'https://www.google.com/', ownOrigin })).toBe(true);
  });

  it('counts a new visit with no referrer: a typed address, a message app, a bookmark', () => {
    expect(isExternalEntry({ navigationType: 'navigate', referrer: '', ownOrigin })).toBe(true);
  });

  it('does not count a move between the pages of the site, the language switch included', () => {
    expect(isExternalEntry({ navigationType: 'navigate', referrer: 'https://example.com/', ownOrigin })).toBe(false);
    expect(
      isExternalEntry({ navigationType: 'navigate', referrer: 'https://example.com/en/cabins/x/', ownOrigin }),
    ).toBe(false);
  });

  it('treats another host, subdomain, scheme or port as outside', () => {
    expect(isExternalEntry({ navigationType: 'navigate', referrer: 'https://www.example.com/', ownOrigin })).toBe(true);
    expect(isExternalEntry({ navigationType: 'navigate', referrer: 'http://example.com/', ownOrigin })).toBe(true);
    expect(isExternalEntry({ navigationType: 'navigate', referrer: 'https://example.com:8443/', ownOrigin })).toBe(
      true,
    );
  });

  it('does not count a reload, a step back or forward, or a page opened in the background', () => {
    for (const navigationType of ['reload', 'back_forward', 'prerender']) {
      expect(isExternalEntry({ navigationType, referrer: 'https://www.google.com/', ownOrigin }), navigationType).toBe(
        false,
      );
    }
  });

  it('does not count an unknown navigation type', () => {
    expect(isExternalEntry({ navigationType: null, referrer: '', ownOrigin })).toBe(false);
  });

  it('treats a referrer that cannot be read as an outside one', () => {
    expect(isExternalEntry({ navigationType: 'navigate', referrer: 'not a url', ownOrigin })).toBe(true);
  });
});
