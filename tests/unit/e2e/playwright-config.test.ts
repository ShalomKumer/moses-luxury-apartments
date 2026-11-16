import { describe, expect, it } from 'vitest';
import config from '../../../playwright.config';

// The browser tests' own setup (CLAUDE.md, rule 6). Two choices are kept on purpose and must not drift without a decision.
describe('playwright.config', () => {
  it('never retries a failed test, so an occasional real fault is not hidden by a second try', () => {
    expect(config.retries).toBe(0);
  });

  it('writes a JSON report, so a run that failed under load can be read afterwards', () => {
    const reporters = Array.isArray(config.reporter) ? config.reporter.map(([name]) => name) : [];
    expect(reporters).toContain('json');
  });

  it('does not trace every test: that made the run 60% slower', () => {
    expect(config.use?.trace).toBeUndefined();
  });
});
