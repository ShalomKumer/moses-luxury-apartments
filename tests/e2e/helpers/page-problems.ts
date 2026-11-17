import type { Page } from '@playwright/test';

/**
 * Starts listening to a page and returns a function that lists what went wrong so far: a script error, a console
 * error (a CSP violation is one), a request that failed or came back as an error, and any request to another host
 * (the site loads nothing from outside: rows L6, C1 and S10). Call it before navigating.
 */
export function watchPage(page: Page): () => string[] {
  const problems: string[] = [];
  const ownHost = '127.0.0.1'; // the test server (playwright.config.ts)
  page.on('pageerror', (error) => problems.push(`script error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console error: ${message.text()}`);
  });
  page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`));
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (host !== ownHost && !request.url().startsWith('data:'))
      problems.push(`request to another host: ${request.url()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return () => [...problems];
}
