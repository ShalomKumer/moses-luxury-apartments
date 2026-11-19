// The photo viewer is one frame of a fixed size (2026-11-10): the frame, the arrows, the close button and the caption box
// stay exactly where they are from photo to photo, however tall, wide or small a photo is, and however long its words
// are. The next and previous photos load before they are asked for, and on a touch screen a swipe moves too.
// Tarpat 18 mixes wide photos, tall ones and small ones, so it is the apartment that would show a frame that changes.
import { expect, test, type Page } from '@playwright/test';
import { axeViolations } from './helpers/run-axe';

const PAGES = [
  {
    label: 'Hebrew',
    path: '/cabins/tarpat-18/',
    forward: 'ArrowLeft',
    rtl: true,
    position: (n: number) => `(${n} מתוך 10)`,
  },
  {
    label: 'English',
    path: '/en/cabins/tarpat-18/',
    forward: 'ArrowRight',
    rtl: false,
    position: (n: number) => `(${n} of 10)`,
  },
];

/** The boxes of the viewer's parts, rounded to a pixel, as they are right now. */
async function frame(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value)) : null;
    };
    return {
      dialog: box('[data-gallery-dialog]'),
      stage: box('[data-gallery-stage]'),
      image: box('[data-gallery-image]'),
      previous: box('[data-gallery-prev]'),
      next: box('[data-gallery-next]'),
      close: box('[data-gallery-close]'),
      caption: box('.gallery__caption'),
    };
  });
}

/** The full address of every photo of the apartment, in order. */
const photoHrefs = (page: Page) =>
  page.locator('[data-gallery-item]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));

/** Waits until the picture of photo `index` (counting from 0) is the one shown in the viewer and has loaded. */
async function shown(page: Page, index: number) {
  const hrefs = await photoHrefs(page);
  await expect
    .poll(() =>
      page.evaluate((href) => {
        const image = document.querySelector<HTMLImageElement>('[data-gallery-image]');
        return Boolean(image && image.src === href && image.complete && image.naturalWidth > 0);
      }, hrefs[index]),
    )
    .toBe(true);
}

for (const { label, path, forward, rtl, position } of PAGES) {
  test.describe(`photo viewer frame, ${label}`, () => {
    test('keeps its size and every control in place across all ten photos', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      await shown(page, 0);
      const first = await frame(page);
      expect(first.dialog).not.toBeNull();
      for (let index = 1; index < 10; index += 1) {
        await page.keyboard.press(forward);
        await expect(page.locator('[data-gallery-caption]')).toContainText(position(index + 1));
        await shown(page, index);
        expect(await frame(page), `photo ${index + 1}`).toEqual(first);
      }
    });

    test('fits inside the window, the photo fits inside the stage, and nothing is cut off', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      await shown(page, 0);
      const view = page.viewportSize();
      const boxes = await frame(page);
      if (!view || !boxes.dialog || !boxes.stage || !boxes.image) throw new Error('no boxes');
      const [x, y, width, height] = boxes.dialog;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + width).toBeLessThanOrEqual(view.width);
      expect(y + height).toBeLessThanOrEqual(view.height);
      // the photo's box is the stage's box: the photo is drawn inside it, whole (object-fit: contain)
      expect(boxes.image).toEqual(boxes.stage);
      expect(await page.locator('[data-gallery-image]').evaluate((img) => getComputedStyle(img).objectFit)).toBe(
        'contain',
      );
      // on a phone the viewer takes the whole screen
      if (view.width < 768) expect([width, height]).toEqual([view.width, view.height]);
    });

    test('shows a counter under the photo and no description, which a screen reader still gets', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      const counter = page.locator('[data-gallery-counter]');
      await expect(counter).toHaveText('1 / 10');
      await expect(counter).toBeVisible();
      await expect(counter).toHaveAttribute('aria-hidden', 'true');
      // the words of the photo are in the live line, out of sight (visually hidden), with the position
      const caption = page.locator('[data-gallery-caption]');
      await expect(caption).toContainText(position(1));
      await expect(caption).toHaveAttribute('aria-live', 'polite');
      expect(((await caption.textContent()) ?? '').length).toBeGreaterThan(position(1).length + 3);
      expect((await caption.boundingBox())?.width ?? 99).toBeLessThanOrEqual(1);
      await page.keyboard.press(forward);
      await expect(counter).toHaveText('2 / 10');
    });

    test('a tap outside the photo closes the viewer; a tap on the photo, an arrow or a drag does not', async ({
      page,
    }) => {
      await page.goto(path);
      const dialog = page.locator('[data-gallery-dialog]');
      const open = async () => {
        await page.locator('[data-gallery-all]').click();
        await expect(dialog).toBeVisible();
        await shown(page, 0);
      };
      await open();
      const boxes = await frame(page);
      if (!boxes.dialog || !boxes.stage) throw new Error('no boxes');
      const [dx, dy, , dh] = boxes.dialog;
      const [sx, sy, sw, sh] = boxes.stage;
      // the middle of the stage is on the photo: nothing happens
      await page.mouse.click(sx + sw / 2, sy + sh / 2);
      await expect(dialog).toBeVisible();
      // an arrow moves the photo and leaves the viewer open
      await page.keyboard.press(forward);
      await page.locator('[data-gallery-next]').click();
      await expect(dialog).toBeVisible();
      // a drag that ends on the empty space is not a tap
      await page.mouse.move(sx + sw / 2, sy + sh / 2);
      await page.mouse.down();
      await page.mouse.move(dx + 4, dy + 4, { steps: 6 });
      await page.mouse.up();
      await expect(dialog).toBeVisible();
      // the space around the stage (the dialog's own padding) closes it
      await page.mouse.click(dx + 6, dy + dh - 6);
      await expect(dialog).toBeHidden();
      // the dark bars of the stage count as empty space too: a click there closes, wherever the photo leaves some
      await open();
      const bar = await page.evaluate(() => {
        const image = document.querySelector<HTMLImageElement>('[data-gallery-image]');
        if (!image) return null;
        const box = image.getBoundingClientRect();
        const scale = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
        const sideBar = (box.width - image.naturalWidth * scale) / 2;
        const topBar = (box.height - image.naturalHeight * scale) / 2;
        // the arrows sit at the middle of the stage's sides, so a point on a side bar is taken near its top
        if (sideBar > 8) return { x: box.left + sideBar / 2, y: box.top + 24 };
        if (topBar > 8) return { x: box.left + box.width / 2, y: box.top + topBar / 2 };
        return null;
      });
      // Tarpat 18's first photo leaves bars on both widths; if a change of layout ever removes them this must fail, not skip
      expect(bar, 'a bar beside the photo to tap').not.toBeNull();
      await page.mouse.click(bar!.x, bar!.y);
      await expect(dialog).toBeHidden();
    });

    test('puts the previous arrow at the start of the line and the next at its end', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      const boxes = await frame(page);
      if (!boxes.previous || !boxes.next) throw new Error('no arrows');
      const previousX = boxes.previous[0];
      const nextX = boxes.next[0];
      if (rtl) expect(previousX).toBeGreaterThan(nextX);
      else expect(previousX).toBeLessThan(nextX);
    });

    test('the arrows and the close button have names, and the open viewer passes axe', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      for (const selector of ['[data-gallery-prev]', '[data-gallery-next]', '[data-gallery-close]']) {
        const name = await page.locator(selector).evaluate((button) => button.textContent?.trim() ?? '');
        expect(name.length).toBeGreaterThan(0);
      }
      expect(await axeViolations(page)).toEqual([]);
    });

    test('starts loading the next and the previous photo before they are asked for', async ({ page }) => {
      await page.goto(path);
      const hrefs = await photoHrefs(page);
      await page.locator('[data-gallery-all]').click();
      await shown(page, 0);
      for (const href of [hrefs[1], hrefs[hrefs.length - 1]]) {
        await expect.poll(() => page.evaluate((url) => performance.getEntriesByName(url).length > 0, href)).toBe(true);
      }
    });

    test('a quick series of presses ends on the last photo', async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      await shown(page, 0);
      for (let press = 0; press < 4; press += 1) await page.keyboard.press(forward);
      await expect(page.locator('[data-gallery-caption]')).toContainText(position(5));
      await shown(page, 4);
    });

    test('still moves with less motion asked for', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      await shown(page, 0);
      await page.keyboard.press(forward);
      await shown(page, 1);
    });

    test('a swipe of a finger moves to the next and the previous photo; a mouse drag or a vertical one does not', async ({
      page,
    }) => {
      await page.goto(path);
      await page.locator('[data-gallery-all]').click();
      await shown(page, 0);
      const caption = page.locator('[data-gallery-caption]');
      // a finger moves left to go on in English and right in Hebrew
      const towardsNext = rtl ? 120 : -120;
      const gesture = (pointerType: string, dx: number, dy: number) =>
        page.evaluate(
          ([type, moveX, moveY]) => {
            const stage = document.querySelector('[data-gallery-stage]') as HTMLElement;
            const at = (name: string, x: number, y: number) =>
              stage.dispatchEvent(
                new PointerEvent(name, { pointerType: type as string, clientX: x, clientY: y, bubbles: true }),
              );
            at('pointerdown', 200, 300);
            at('pointerup', 200 + (moveX as number), 300 + (moveY as number));
          },
          [pointerType, dx, dy],
        );

      await gesture('mouse', towardsNext, 0);
      await gesture('touch', towardsNext, 160);
      await gesture('touch', 10, 0);
      await expect(caption).toContainText(position(1));

      await gesture('touch', towardsNext, 5);
      await expect(caption).toContainText(position(2));
      await shown(page, 1);
      await gesture('touch', -towardsNext, -5);
      await expect(caption).toContainText(position(1));
    });
  });
}
