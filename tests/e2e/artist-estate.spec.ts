// The Artist's Estate, the first real apartment (stage 5): ten photos, so the grid shows five and the viewer reaches
// all ten; the photos are WebP with a srcset; the home page's hero is its terrace; the page works without JavaScript.
// When more real apartments arrive, keep what is about this one and move the rest.
import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/cabins/artist-estate/', home: '/', label: 'Hebrew', forward: 'ArrowLeft', position: /^.* \(10 מתוך 10\)$/ },
  {
    path: '/en/cabins/artist-estate/',
    home: '/en/',
    label: 'English',
    forward: 'ArrowRight',
    position: /^.* \(10 of 10\)$/,
  },
];

for (const { path, home, label, forward, position } of PAGES) {
  test.describe(`the Artist's Estate, ${label}`, () => {
    test('the grid shows five photos, the other five are reached by the viewer only', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.gallery__item:not(.gallery__item--extra) img')).toHaveCount(5);
      await expect(page.locator('[data-gallery-item]')).toHaveCount(10);
      await expect(page.locator('.gallery__item--extra img')).toHaveCount(0);
      await expect(page.locator('[data-gallery-all]')).toContainText('10');
      // once the script runs, the five beyond the grid are hidden (a rule once showed them on a wide screen)
      for (const extra of await page.locator('.gallery__item--extra').all()) await expect(extra).toBeHidden();
    });

    test('every grid photo is a WebP with a srcset and really loads', async ({ page }) => {
      await page.goto(path);
      const images = page.locator('.gallery__item:not(.gallery__item--extra) img');
      for (let index = 0; index < 5; index++) {
        const image = images.nth(index);
        await expect(image).toHaveAttribute('srcset', /640w, .*1280w/);
        await expect(image).toHaveAttribute('src', /\/photos\/artist-estate\/.+-1280\.webp$/);
      }
      expect(await images.first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    });

    test('the viewer opens the largest file and reaches the tenth photo', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      await page.keyboard.press(forward);
      const image = page.locator('[data-gallery-image]');
      await expect(image).toHaveAttribute('src', /\/photos\/artist-estate\/living-room-1920\.webp$/);
      for (let step = 0; step < 8; step++) await page.keyboard.press(forward);
      await expect(page.locator('[data-gallery-caption]')).toHaveText(position);
    });

    test('the request takes up to fourteen guests', async ({ page }) => {
      await page.goto(path);
      const guests = page.locator('[data-request-guests]');
      await expect(guests.locator('option[value="14"]')).toBeEnabled();
      await expect(guests.locator('option[value="15"]')).toHaveCount(0);
    });

    test('the home page opens with its terrace photo, described in words', async ({ page }) => {
      await page.goto(home);
      const hero = page.locator('.hero__photo');
      await expect(hero).toHaveAttribute('src', /\/photos\/artist-estate\/terrace-sunset-1280\.webp$/);
      await expect(hero).toHaveAttribute('srcset', /terrace-sunset-640\.webp 640w, .*terrace-sunset-1280\.webp 1280w/);
      expect(await hero.getAttribute('alt')).not.toBe('');
      expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(page.locator('.row').first()).toContainText(
        label === 'Hebrew' ? 'אחוזת האמן' : "The Artist's Estate",
      );
    });
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the photos beyond the grid are links named by their words, and every link goes to a real file', async ({
    page,
    request,
    baseURL,
  }) => {
    await page.goto('/en/cabins/artist-estate/');
    const extras = page.locator('.gallery__item--extra a');
    await expect(extras).toHaveCount(5);
    await expect(extras.first()).toBeVisible();
    await expect(extras.first()).not.toHaveText('');
    const hrefs = await page
      .locator('[data-gallery-item]')
      .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute('href')));
    expect(hrefs).toHaveLength(10);
    for (const href of hrefs) expect((await request.get(`${baseURL}${href}`)).ok(), href ?? '').toBe(true);
  });
});
