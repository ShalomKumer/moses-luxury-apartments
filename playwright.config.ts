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
  // No retry on purpose: a test that fails once and passes the second time would hide a real, occasional fault.
  retries: 0,
  // The JSON report (test-results/report.json, not committed) lists every test with its duration and error, so a run that failed under load
  // can be read afterwards. A trace of each test would say more but made the run 60% slower (4.6 -> 7.4 minutes, measured 2026-11-15).
  // tests/unit/e2e/playwright-config.test.ts pins both choices.
  reporter: [['dot'], ['json', { outputFile: 'test-results/report.json' }]],
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
    {
      name: 'phone',
      use: {
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        // a phone says so in its user agent, which is how the email button tells it from a computer (mail-device.ts)
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      },
    },
  ],
});
