// The language offer (2026-11-10): a thin bar fixed to the bottom of the screen, in the other language, for a visitor who arrives from
// outside the site and whose browser prefers that language. Never a redirect, never stored, shown once (a move inside the
// site, a reload and a step back show none), closable, and in both directions (L3, L4, S9, A3-A5, A7, WCAG 3.2.2).
import { expect, test, type Page } from '@playwright/test';
import { obscuredFocus } from './helpers/focus-obscured';
import { axeViolations } from './helpers/run-axe';

const OUTSIDE = 'https://www.google.com/';
const offer = (page: Page) => page.locator('[data-language-offer]');

const CASES = [
  {
    label: 'a Hebrew page, an English browser',
    browser: 'en-US',
    path: '/cabins/nobility-1/',
    twin: '/en/cabins/nobility-1',
    message: 'This site is also available in English',
    link: 'Switch to English',
    close: 'Close',
    lang: 'en',
    dir: 'ltr',
  },
  {
    label: 'an English page, a Hebrew browser',
    browser: 'he-IL',
    path: '/en/cabins/nobility-1/',
    twin: '/cabins/nobility-1',
    message: 'האתר זמין גם בעברית',
    link: 'מעבר לעברית',
    close: 'סגירה',
    lang: 'he',
    dir: 'rtl',
  },
];

for (const { label, browser, path, twin, message, link, close, lang, dir } of CASES) {
  test.describe(label, () => {
    test.use({ locale: browser });

    test('shows the offer in the other language, with a link to the same page there', async ({ page }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      await expect(offer(page)).toContainText(message);
      await expect(offer(page)).toHaveAttribute('lang', lang);
      await expect(offer(page)).toHaveAttribute('dir', dir);
      const anchor = offer(page).getByRole('link', { name: link });
      await expect(anchor).toHaveAttribute('href', twin);
      await expect(anchor).toHaveAttribute('hreflang', lang);
      await expect(offer(page).getByRole('button', { name: close })).toBeVisible();
    });

    test('sits at the bottom of the screen and moves nothing: the header stays where it was', async ({
      page,
      viewport,
    }) => {
      await page.goto(path);
      const before = (await page.locator('.site-header').boundingBox())!.y;
      await expect(offer(page)).toBeVisible();
      const bar = (await offer(page).boundingBox())!;
      expect(bar.y).toBeGreaterThan((viewport?.height ?? 0) / 2);
      expect(bar.y + bar.height).toBeLessThanOrEqual((viewport?.height ?? 0) + 1);
      expect((await page.locator('.site-header').boundingBox())!.y).toBe(before);
      // the phone's "jump to the request" button, when it is there, stays whole above nothing of the bar's
      const jump = page.locator('.jump .button');
      if (await jump.isVisible()) expect(bar.y + bar.height).toBeLessThanOrEqual((await jump.boundingBox())!.y + 1);
    });

    test('lets the back-to-top button rise above it, and brings it back down when the bar is closed', async ({
      page,
    }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
      const top = page.locator('[data-back-to-top]');
      await expect(top).toBeVisible();
      const bar = (await offer(page).boundingBox())!;
      expect((await top.boundingBox())!.y + (await top.boundingBox())!.height).toBeLessThanOrEqual(bar.y + 1);
      await offer(page).getByRole('button', { name: close }).click();
      await expect(offer(page)).toBeHidden();
      await expect
        .poll(async () => (await top.boundingBox())!.y + (await top.boundingBox())!.height)
        .toBeGreaterThan(bar.y);
    });

    test('shows it to a visitor with no referrer too: a typed address, a message app', async ({ page }) => {
      await page.goto(path);
      await expect(offer(page)).toBeVisible();
    });

    test('is a link the visitor follows, never a redirect: the page stays where it is until the link is clicked', async ({
      page,
    }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      expect(new URL(page.url()).pathname).toBe(path);
      await offer(page).getByRole('link', { name: link }).click();
      await expect(page).toHaveURL(new RegExp(`${twin}/?$`));
      // the visitor came from the site's own page, so the other page shows no offer: once is enough
      await expect(offer(page)).toBeHidden();
    });

    test('closes with the button, leaves focus at the top of the page and does not come back on a move inside the site', async ({
      page,
    }) => {
      await page.goto(path, { referer: OUTSIDE });
      await offer(page).getByRole('button', { name: close }).click();
      await expect(offer(page)).toBeHidden();
      expect(await page.evaluate(() => document.activeElement?.id)).toBe('top');
      await page.locator('.site-header__logo').click();
      await expect(offer(page)).toBeHidden();
    });

    test('is reached and closed from the keyboard', async ({ page }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      await page.keyboard.press('Tab'); // the skip link
      await page.keyboard.press('Tab');
      await expect(offer(page).getByRole('link', { name: link })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(offer(page).getByRole('button', { name: close })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(offer(page)).toBeHidden();
      expect(await page.evaluate(() => document.activeElement?.id)).toBe('top');
    });

    test('hides no focused element behind it, down to the last link of the footer (2.4.11)', async ({ page }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      expect(await obscuredFocus(page)).toEqual([]);
    });

    test('is not shown again after a reload', async ({ page }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      await page.reload();
      await expect(offer(page)).toBeHidden();
    });

    test('stores nothing: no cookie and no browser storage, shown or closed', async ({ page, context }) => {
      await page.goto(path, { referer: OUTSIDE });
      await offer(page).getByRole('button', { name: close }).click();
      expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
      expect(await context.cookies()).toEqual([]);
    });

    test('has no axe violations, fits the screen and has targets of at least 44 px', async ({ page, viewport }) => {
      await page.goto(path, { referer: OUTSIDE });
      await expect(offer(page)).toBeVisible();
      expect(await axeViolations(page)).toEqual([]);
      const box = await offer(page).boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport?.width ?? 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      for (const target of [offer(page).getByRole('link', { name: link }), offer(page).getByRole('button')]) {
        const size = await target.boundingBox();
        expect(size!.height).toBeGreaterThanOrEqual(44);
        expect(size!.width).toBeGreaterThanOrEqual(44);
      }
    });
  });
}

test.describe('a browser in the same language as the page', () => {
  test('shows no offer on a Hebrew page to a Hebrew browser', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'he-IL' });
    const page = await context.newPage();
    await page.goto('/cabins/nobility-1/', { referer: OUTSIDE });
    await expect(offer(page)).toBeHidden();
    await context.close();
  });

  test('shows no offer on an English page to an English browser', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-GB' });
    const page = await context.newPage();
    await page.goto('/en/', { referer: OUTSIDE });
    await expect(offer(page)).toBeHidden();
    await context.close();
  });
});

test.describe('a browser in neither language', () => {
  test.use({ locale: 'fr-FR' });

  test('is offered English on a Hebrew page and nothing on an English one', async ({ page }) => {
    await page.goto('/', { referer: OUTSIDE });
    await expect(offer(page)).toBeVisible();
    await expect(offer(page)).toContainText('available in English');
    await page.goto('/en/', { referer: OUTSIDE });
    await expect(offer(page)).toBeHidden();
  });
});

test.describe('the offer without JavaScript', () => {
  test.use({ locale: 'en-US', javaScriptEnabled: false });

  test('stays hidden, and the language switch is still in the header', async ({ page }) => {
    await page.goto('/', { referer: OUTSIDE });
    await expect(offer(page)).toBeHidden();
    await expect(page.locator('[data-lang-switch]')).toBeVisible();
  });
});
