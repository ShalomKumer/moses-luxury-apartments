import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lineOf, listFiles, projectPath, readText, ROOT } from './helpers/source-files';

/**
 * The user's rule of 2026-10-31: no visitor sees whether a place is free or taken, and the site has no date-search
 * calendar (changed 2026-11-10: one date picker is allowed, to fill the message only; see below). The availability code is kept in `domain/` and `server/` for a future admin view (behind a sign-in), but
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

  /**
   * The user's decision of 2026-11-10 (replacing the rule of 2026-10-31 that allowed no calendar at all): the booking
   * request has ONE date picker, a calendar that only fills the dates of the message. It marks no day as free or taken,
   * looks nothing up and books nothing. The calendar lives in these files and nowhere else (H7, L8).
   */
  const PICKER_FILES = [
    'src/components/booking/DateRangePicker.astro',
    'src/components/booking/FlexChips.astro',
    'src/components/booking/calendar-render.ts',
    'src/components/booking/picker-controller.ts',
  ];

  /** A file's code without its comments, so a comment may explain what the picker does not do. */
  const withoutComments = (file: string) =>
    readText(join(ROOT, file))
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^\s*\/\/.*$/gm, '');

  it('has no native date field: the one date picker is the only way to choose dates', () => {
    const holders = visitorFiles()
      .filter((file) => /type\s*=\s*["']date["']/.test(readText(file)))
      .map(projectPath);
    expect(holders).toEqual([]);
  });

  it('keeps the calendar inside the date picker files', () => {
    const calendarCode =
      /monthWeeks|renderMonths|calendar-month|calendar-render|picker-controller|class="cal__|data-picker/;
    const holders = visitorFiles()
      .filter((file) => calendarCode.test(readText(file)))
      .map(projectPath)
      .filter((file) => !PICKER_FILES.includes(file) && file !== 'src/components/booking/BookingRequest.astro');
    expect(holders).toEqual([]);
    for (const file of PICKER_FILES) expect(existsSync(join(ROOT, file)), file).toBe(true);
  });

  it('never marks a day as free or taken, in the picker or in the words it shows', () => {
    const wording = /availab|\bfree\b|\btaken\b|\bbusy\b|\bbooked\b|\bvacant\b|פנוי|תפוס|זמינות|זמין|תפוסה|פנויה/i;
    for (const file of PICKER_FILES) expect(withoutComments(file), file).not.toMatch(wording);
    const en = readText(join(ROOT, 'src/i18n/messages/en.ts'));
    const he = readText(join(ROOT, 'src/i18n/messages/he.ts'));
    for (const text of [en, he]) {
      const picker = text.slice(text.indexOf('picker: {'), text.indexOf('previewLabel'));
      expect(picker.length).toBeGreaterThan(100);
      expect(picker).not.toMatch(wording);
    }
  });

  it('does not let the picker import the availability code, a server file or a network call', () => {
    for (const file of PICKER_FILES) {
      const code = withoutComments(file);
      expect(code, file).not.toMatch(
        /availability|calendar-source|fetch-calendar|\bical\b|@server|fetch\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie/,
      );
    }
  });
});
