// Every page of the build, in a real browser, at desktop width and at 375 px (CLAUDE.md, rule 6; rows A3-A5).
import { expect, test } from '@playwright/test';
import { builtPages } from './helpers/built-pages';
import { obscuredFocus } from './helpers/focus-obscured';
import { watchPage } from './helpers/page-problems';
import { axeViolations } from './helpers/run-axe';

for (const path of builtPages()) {
  const isNotFoundPage = path === '/404.html';

  test.describe(path, () => {
    test('has no axe violations at WCAG 2.2 AA', async ({ page }) => {
      await page.goto(path);
      expect(await axeViolations(page)).toEqual([]);
    });

    test('loads cleanly: no script error, CSP violation, failed request or outside host', async ({ page }) => {
      const problems = watchPage(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(problems()).toEqual([]);
    });

    test('does not scroll sideways', async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test('keeps keyboard focus visible, never hidden behind other content (2.4.11)', async ({ page }) => {
      await page.goto(path);
      expect(await obscuredFocus(page)).toEqual([]);
    });

    test('declares its language and direction', async ({ page }) => {
      await page.goto(path);
      const isEnglish = path.startsWith('/en/') || path === '/en/';
      const root = page.locator('html');
      if (!isNotFoundPage) await expect(root).toHaveAttribute('lang', isEnglish ? 'en' : 'he');
      await expect(root).toHaveAttribute('dir', isEnglish ? 'ltr' : 'rtl');
    });
  });
}
