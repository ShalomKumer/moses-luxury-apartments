// The real apartments (stage 5), one table entry each: ten photos unless the entry says `photos`, so the grid shows five and
// the viewer reaches all of them; the photos are WebP with a srcset; the request takes up to the apartment's own guest cap; the page works without
// JavaScript; the features list says Wi-Fi (the owner's standing rule). The home page opens with the first apartment's photo.
// Add an entry when a real apartment arrives.
import { expect, test } from '@playwright/test';

// `gridSrc`: the width of the file each of the five grid photos names as its src. A small source (a phone photo, a
// cropped screenshot) has no 1280 file, so its src is the 960 one; every other photo must keep its 1280 file.
const FULL_SRC = [1280, 1280, 1280, 1280, 1280];
const APARTMENTS = [
  {
    id: 'artist-estate',
    second: 'living-room',
    maxGuests: 14,
    gridSrc: FULL_SRC,
    nameHe: 'אחוזת האמן',
    nameEn: "The Artist's Estate",
  },
  {
    id: 'atzulat-hakikar-b',
    second: 'jacuzzi',
    maxGuests: 11,
    gridSrc: FULL_SRC,
    nameHe: 'אצולת הכיכר ב׳',
    nameEn: 'Atzulat HaKikar B',
  },
  {
    id: 'atzulat-hakikar-a',
    second: 'bedroom-stone',
    maxGuests: 11,
    gridSrc: FULL_SRC,
    nameHe: 'אצולת הכיכר א׳',
    nameEn: 'Atzulat HaKikar A',
  },
  {
    id: 'tarpat-18',
    second: 'living-dining',
    maxGuests: 9,
    gridSrc: [960, 1280, 960, 1280, 1280],
    nameHe: 'תרפ"ט 18',
    nameEn: 'Tarpat 18',
  },
  {
    id: 'ahuzat-hamaayan',
    second: 'living-loft',
    maxGuests: 9,
    gridSrc: FULL_SRC,
    nameHe: 'אחוזת המעיין',
    nameEn: 'Ahuzat HaMaayan',
  },
  {
    id: 'panorami-yerushalayim-97',
    second: 'living-dining',
    maxGuests: 18,
    gridSrc: FULL_SRC,
    nameHe: 'פנורמי ירושלים 97',
    nameEn: 'Panorami',
  },
  {
    id: 'avira-drashbi',
    second: 'living-sofa',
    maxGuests: 14,
    gridSrc: FULL_SRC,
    nameHe: 'אווירא דרשב"י',
    nameEn: "Avira D'Rashbi",
  },
  {
    // eight photos; most were cut to 1600 px for weight, so the second one's largest file is the 1280 one
    id: 'maayan-a',
    second: 'courtyard-jacuzzi',
    secondWidth: 1280,
    photos: 8,
    maxGuests: 2,
    gridSrc: FULL_SRC,
    nameHe: 'מעיין א׳',
    nameEn: "Ma'ayan A",
  },
  {
    // the same eight photo files as Ma'ayan A (another unit; the user's decision, 2026-11-08)
    id: 'maayan-b',
    photoFolder: 'maayan-a',
    second: 'courtyard-jacuzzi',
    secondWidth: 1280,
    photos: 8,
    maxGuests: 2,
    gridSrc: FULL_SRC,
    nameHe: 'מעיין ב׳',
    nameEn: "Ma'ayan B",
  },
  {
    // eight photos; the main photo is under 1920 px wide (no 1920 file), the second one has a 1920 file
    id: 'nobility-1',
    second: 'bed',
    photos: 8,
    maxGuests: 2,
    gridSrc: FULL_SRC,
    nameHe: 'נוביליטי 1',
    nameEn: 'Nobility 1',
  },
  {
    id: 'nobility-2',
    second: 'bedroom-jacuzzi',
    maxGuests: 2,
    gridSrc: FULL_SRC,
    nameHe: 'נוביליטי 2',
    nameEn: 'Nobility 2',
  },
  {
    id: 'nobility-3',
    second: 'suite-wide',
    maxGuests: 2,
    gridSrc: FULL_SRC,
    nameHe: 'נוביליטי 3',
    nameEn: 'Nobility 3',
  },
  {
    // six photos from 1024 px web copies, so every file is at most 960 px wide
    id: 'tet-zayin-8',
    second: 'jacuzzi-bath',
    secondWidth: 960,
    photos: 6,
    maxGuests: 2,
    gridSrc: [960, 960, 960, 960, 960],
    nameHe: 'צימר ט״ז 8',
    nameEn: 'Tet-Zayin 8',
  },
];

const LOCALES = [
  {
    label: 'Hebrew',
    base: '/cabins',
    forward: 'ArrowLeft',
    position: (n: number) => new RegExp(`^.* \\(${n} מתוך ${n}\\)$`),
    wifi: 'אינטרנט אלחוטי',
  },
  {
    label: 'English',
    base: '/en/cabins',
    forward: 'ArrowRight',
    position: (n: number) => new RegExp(`^.* \\(${n} of ${n}\\)$`),
    wifi: 'Wi-Fi',
  },
];

for (const { id, photoFolder = id, second, secondWidth = 1920, maxGuests, gridSrc, photos = 10 } of APARTMENTS) {
  for (const { label, base, forward, position, wifi } of LOCALES) {
    test.describe(`${id}, ${label}`, () => {
      const path = `${base}/${id}/`;

      test('the grid shows five photos, the rest are reached by the viewer only', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('.gallery__item:not(.gallery__item--extra) img')).toHaveCount(5);
        await expect(page.locator('[data-gallery-item]')).toHaveCount(photos);
        await expect(page.locator('.gallery__item--extra img')).toHaveCount(0);
        await expect(page.locator('[data-gallery-all]')).toContainText(String(photos));
        // once the script runs, the five beyond the grid are hidden (a rule once showed them on a wide screen)
        for (const extra of await page.locator('.gallery__item--extra').all()) await expect(extra).toBeHidden();
      });

      test('every grid photo is a WebP with a srcset and really loads', async ({ page }) => {
        await page.goto(path);
        const images = page.locator('.gallery__item:not(.gallery__item--extra) img');
        for (let index = 0; index < 5; index++) {
          const image = images.nth(index);
          const width = gridSrc[index];
          await expect(image).toHaveAttribute('srcset', new RegExp(`640w, .*${width}w`));
          await expect(image).toHaveAttribute('src', new RegExp(`/photos/${photoFolder}/.+-${width}\\.webp$`));
        }
        expect(await images.first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(
          true,
        );
      });

      test('the viewer opens the largest file and reaches the last photo', async ({ page }) => {
        await page.goto(path);
        await page.locator('[data-gallery-all]').click();
        await page.keyboard.press(forward);
        await expect(page.locator('[data-gallery-image]')).toHaveAttribute(
          'src',
          new RegExp(`/photos/${photoFolder}/${second}-${secondWidth}\\.webp$`),
        );
        for (let step = 0; step < photos - 2; step++) await page.keyboard.press(forward);
        await expect(page.locator('[data-gallery-caption]')).toHaveText(position(photos));
      });

      test('the features list says the apartment has Wi-Fi (a standing rule of the owner)', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('.cabin-facts__features')).toContainText(wifi);
      });

      test(`the request takes up to ${maxGuests} guests`, async ({ page }) => {
        await page.goto(path);
        const guests = page.locator('[data-request-guests]');
        await expect(guests.locator(`option[value="${maxGuests}"]`)).toBeEnabled();
        await expect(guests.locator(`option[value="${maxGuests + 1}"]`)).toHaveCount(0);
      });
    });
  }
}

for (const { label, home, nameKey } of [
  { label: 'Hebrew', home: '/', nameKey: 'nameHe' as const },
  { label: 'English', home: '/en/', nameKey: 'nameEn' as const },
]) {
  test.describe(`the home page, ${label}`, () => {
    test('opens with the Artist’s Estate terrace photo, described in words', async ({ page }) => {
      await page.goto(home);
      const hero = page.locator('.hero__photo');
      await expect(hero).toHaveAttribute('src', /\/photos\/artist-estate\/terrace-sunset-1280\.webp$/);
      await expect(hero).toHaveAttribute('srcset', /terrace-sunset-640\.webp 640w, .*terrace-sunset-1280\.webp 1280w/);
      expect(await hero.getAttribute('alt')).not.toBe('');
      expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    });

    test('lists the real apartments first, in their order', async ({ page }) => {
      await page.goto(home);
      const rows = page.locator('.row');
      for (const [index, apartment] of APARTMENTS.entries()) {
        await expect(rows.nth(index)).toContainText(apartment[nameKey]);
      }
    });
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const { id, photos = 10 } of APARTMENTS) {
    test(`${id}: the photos beyond the grid are links named by their words, and every link goes to a real file`, async ({
      page,
      request,
      baseURL,
    }) => {
      await page.goto(`/en/cabins/${id}/`);
      const extras = page.locator('.gallery__item--extra a');
      await expect(extras).toHaveCount(photos - 5);
      await expect(extras.first()).toBeVisible();
      await expect(extras.first()).not.toHaveText('');
      const hrefs = await page
        .locator('[data-gallery-item]')
        .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute('href')));
      expect(hrefs).toHaveLength(photos);
      for (const href of hrefs) expect((await request.get(`${baseURL}${href}`)).ok(), href ?? '').toBe(true);
    });
  }
});
