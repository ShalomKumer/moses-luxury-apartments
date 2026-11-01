// The checks themselves are tested: a check that never fails proves nothing. Each runs on a tiny page built here.
import { expect, test } from '@playwright/test';
import { obscuredFocus } from './helpers/focus-obscured';
import { watchPage } from './helpers/page-problems';
import { axeViolations } from './helpers/run-axe';

test.describe('the checkers catch what they are for', () => {
  test('axe reports an image without alt text and a button without a name', async ({ page }) => {
    await page.setContent('<html lang="en"><title>t</title><main><img src="data:,"><button></button></main></html>');
    const found = (await axeViolations(page)).join('\n');
    expect(found).toContain('image-alt');
    expect(found).toContain('button-name');
  });

  test('axe reports nothing on a plain accessible page', async ({ page }) => {
    await page.setContent(
      '<html lang="en"><title>t</title><body><main><h1>Hello</h1><a href="/x">Read more</a></main>',
    );
    expect(await axeViolations(page)).toEqual([]);
  });

  test('the focus check reports a link hidden behind a fixed bar, and not a free one', async ({ page }) => {
    await page.setContent(
      '<a href="/hidden" style="position:absolute;top:10px">hidden link</a>' +
        '<a href="/free" style="position:absolute;top:200px">free link</a>' +
        '<div style="position:fixed;inset:0 0 auto 0;height:60px;background:#000"></div>', // last, so it paints on top
    );
    const found = (await obscuredFocus(page)).join();
    expect(found).toContain('hidden link');
    expect(found).not.toContain('free link');
  });

  test('the focus check accepts a link that wraps onto two lines', async ({ page }) => {
    await page.setContent(
      '<p style="width:120px">some text <a href="/wrapped">a long link that wraps onto a second line</a> and more</p>',
    );
    expect(await obscuredFocus(page)).toEqual([]);
  });

  test('the page watcher reports a script error, a console error and a request to another host', async ({ page }) => {
    const problems = watchPage(page);
    await page.route('https://example.invalid/**', (route) => route.abort());
    await page.setContent(
      '<script>console.error("boom"); setTimeout(() => { throw new Error("late") })</script>' +
        '<img src="https://example.invalid/a.png" alt="">',
    );
    await page.waitForTimeout(200);
    const text = problems().join('\n');
    expect(text).toContain('console error: boom');
    expect(text).toContain('script error: late');
    expect(text).toContain('request to another host: https://example.invalid/a.png');
  });
});
