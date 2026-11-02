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
  /** The visitor-facing files: pages, components and content. */
  const visitorFiles = () =>
    listFiles('src', ['.astro', '.ts', '.md']).filter((file) =>
      /^src\/(pages|components|content)\//.test(projectPath(file)),
    );

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

  it('shows no calendar grid or free/taken wording to a visitor', () => {
    const wording = /data-calendar|aria-label="[^"]*(פנוי|תפוס)|>(פנוי|תפוס|פנויה|תפוסה)</g;
    const offenders = visitorFiles().flatMap((file) => {
      const text = readText(file);
      return [...text.matchAll(wording)].map((match) => `${projectPath(file)}:${lineOf(text, match.index)}`);
    });
    expect(offenders).toEqual([]);
  });

  /** The user's decision of 2026-10-31: the request bar's two dates only write the message (docs/design/home.md). */
  it('allows a date field only inside the booking-request bar, never next to a calendar or a result', () => {
    const holders = visitorFiles()
      .filter((file) => /type\s*=\s*["']date["']/.test(readText(file)))
      .map(projectPath);
    expect(holders).toEqual(['src/components/booking/BookingDates.astro']);
    expect(
      readText(join(ROOT, 'src/components/booking/BookingDates.astro')).replace(/\/\*\*[\s\S]*?\*\//, ''),
    ).not.toMatch(/calendar|availab|free|taken|פנוי|תפוס/i);
  });
});
