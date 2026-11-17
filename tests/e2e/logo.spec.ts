// The owner's logo (2026-11-08): the roof and both names at the top of every page, the whole lockup (with its English lines)
// in the contact area. Both load, keep the size their width and height attributes reserve, have their alt text, and do
// not make the page scroll sideways.
import { expect, test } from '@playwright/test';

const PAGES = [
  { label: 'Hebrew home', path: '/', alt: 'דירת מוזס, Moses Luxury Apartments' },
  { label: 'English home', path: '/en/', alt: 'Moses Luxury Apartments' },
  { label: 'a Hebrew apartment', path: '/cabins/nobility-1/', alt: 'דירת מוזס, Moses Luxury Apartments' },
  { label: 'an English apartment', path: '/en/cabins/nobility-1/', alt: 'Moses Luxury Apartments' },
];

for (const { label, path, alt } of PAGES) {
  test.describe(label, () => {
    test('the header logo is the roof and the names, loads, and reserves its own size', async ({ page }) => {
      await page.goto(path);
      const logo = page.locator('.site-header__logo img');
      await expect(logo).toHaveAttribute('src', '/brand/logo-name.webp');
      await expect(logo).toHaveAttribute('alt', alt);
      const sizes = await logo.evaluate((img: HTMLImageElement) => ({
        loaded: img.complete && img.naturalWidth > 0,
        natural: [img.naturalWidth, img.naturalHeight],
        reserved: [Number(img.getAttribute('width')), Number(img.getAttribute('height'))],
      }));
      expect(sizes.loaded).toBe(true);
      expect(sizes.reserved).toEqual(sizes.natural);
    });

    test('the contact logo is the whole lockup, loads once it is near, and reserves its own size', async ({ page }) => {
      await page.goto(path);
      const logo = page.locator('.contact__logo');
      await logo.scrollIntoViewIfNeeded();
      await expect(logo).toHaveAttribute('src', '/brand/logo-full.webp');
      await expect(logo).toHaveAttribute('alt', alt);
      await expect
        .poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
        .toBe(true);
      const sizes = await logo.evaluate((img: HTMLImageElement) => ({
        natural: [img.naturalWidth, img.naturalHeight],
        reserved: [Number(img.getAttribute('width')), Number(img.getAttribute('height'))],
      }));
      expect(sizes.reserved).toEqual(sizes.natural);
    });

    test('the page does not scroll sideways', async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}
