import { defineConfig } from '@playwright/test';

/** The port of the test server (tests/e2e/server), which serves the built site and sends the real headers. */
const PORT = 4322;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// Browser tests over `dist/client` (CLAUDE.md, rule 6; rows A3-A5). Run after `npm run build`: `npm run test:e2e`.
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  outputDir: 'test-results',
  fullyParallel: true,
  retries: 0,
  reporter: [['dot']],
  use: { baseURL: ORIGIN, browserName: 'chromium' },
  webServer: {
    command: `node tests/e2e/server/start.mjs ${PORT}`,
    url: `${ORIGIN}/`,
    reuseExistingServer: false,
    timeout: 15_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    // 375 px is the narrowest phone the standards name (docs/standards.md, section 8).
    { name: 'phone', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
});
