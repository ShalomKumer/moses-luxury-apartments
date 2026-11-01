import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lineOf, listFiles, projectPath, readText, ROOT } from './helpers/source-files';

/**
 * The user's rule of 2026-10-31: no visitor sees whether a place is free or taken, and the site has no date-search
 * calendar. The availability code is kept in `domain/` and `server/` for a future admin view (behind a sign-in), but
 * nothing a visitor can reach may use it. This test fails the day a page, a component or a public route does (H7, L8).
 */
describe('no availability for visitors', () => {
  it('has no API route and no page that runs on request', () => {
    expect(existsSync(join(ROOT, 'src/pages/api'))).toBe(false);
    const onDemand = listFiles('src/pages', ['.astro', '.ts']).filter((file) =>
      /prerender\s*=\s*false/.test(readText(file)),
    );
    expect(onDemand.map(projectPath)).toEqual([]);
  });

  it('pages and components never import the availability code', () => {
    const importsAvailability = /from\s*['"][^'"]*(availability|calendar-source|fetch-calendar|ical)[^'"]*['"]/g;
    const offenders = listFiles('src', ['.astro', '.ts'])
      .filter((file) => /^src\/(pages|components)\//.test(projectPath(file)))
      .flatMap((file) => {
        const text = readText(file);
        return [...text.matchAll(importsAvailability)].map(
          (match) => `${projectPath(file)}:${lineOf(text, match.index)}`,
        );
      });
    expect(offenders).toEqual([]);
  });

  it('shows no date field, calendar grid or free/taken wording to a visitor', () => {
    const wording = /type\s*=\s*["']date["']|data-calendar|aria-label="[^"]*(פנוי|תפוס)|>(פנוי|תפוס|פנויה|תפוסה)</g;
    const offenders = listFiles('src', ['.astro', '.ts', '.md'])
      .filter((file) => /^src\/(pages|components|content)\//.test(projectPath(file)))
      .flatMap((file) => {
        const text = readText(file);
        return [...text.matchAll(wording)].map((match) => `${projectPath(file)}:${lineOf(text, match.index)}`);
      });
    expect(offenders).toEqual([]);
  });
});
