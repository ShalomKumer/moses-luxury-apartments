import { describe, expect, it } from 'vitest';
import { evaluateAudit } from '../../../scripts/audit/audit-gate.mjs';
import { REVIEWED_ADVISORIES } from '../../../scripts/audit/reviewed-advisories.mjs';

const URL = (id: string) => `https://github.com/advisories/${id}`;

/** One advisory the way `npm audit --json` writes it inside a vulnerability's `via`. */
const advisory = (id: string, severity: string, name = 'picomatch') => ({
  source: 1,
  name,
  title: `${name} problem`,
  url: URL(id),
  severity,
  range: '<=1.0.0',
});

/** A report with the given vulnerabilities (name -> its `via` list). */
const report = (vulnerabilities: Record<string, unknown[]>) => ({
  vulnerabilities: Object.fromEntries(Object.entries(vulnerabilities).map(([name, via]) => [name, { name, via }])),
});

const REVIEWED = [
  { id: 'GHSA-aaaa-bbbb-cccc', package: 'picomatch', reason: 'a test reason', reviewUntil: '2026-12-17' },
];
const TODAY = '2026-11-17';

describe('evaluateAudit', () => {
  it('passes a report with no vulnerabilities', () => {
    expect(evaluateAudit(report({}), [], TODAY)).toEqual({ failures: [], accepted: [] });
  });

  it('fails on a high advisory that nobody reviewed, naming the advisory and the package', () => {
    const { failures } = evaluateAudit(report({ vite: [advisory('GHSA-xxxx-yyyy-zzzz', 'high', 'vite')] }), [], TODAY);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('GHSA-xxxx-yyyy-zzzz');
    expect(failures[0]).toContain('vite');
  });

  it('fails on a critical advisory that nobody reviewed', () => {
    const { failures } = evaluateAudit(report({ x: [advisory('GHSA-xxxx-yyyy-zzzz', 'critical')] }), [], TODAY);
    expect(failures).toHaveLength(1);
  });

  it('ignores moderate and low advisories, as `npm audit --audit-level=high` does', () => {
    const result = evaluateAudit(
      report({ a: [advisory('GHSA-1111-2222-3333', 'moderate')], b: [advisory('GHSA-4444-5555-6666', 'low')] }),
      [],
      TODAY,
    );
    expect(result.failures).toEqual([]);
  });

  it('ignores a via entry that is only the name of another vulnerable package', () => {
    expect(evaluateAudit(report({ vitest: ['picomatch', 'vite'] }), [], TODAY).failures).toEqual([]);
  });

  it('accepts a reviewed high advisory inside its review window and lists it', () => {
    const result = evaluateAudit(report({ picomatch: [advisory('GHSA-aaaa-bbbb-cccc', 'high')] }), REVIEWED, TODAY);
    expect(result.failures).toEqual([]);
    expect(result.accepted).toEqual([expect.objectContaining({ id: 'GHSA-aaaa-bbbb-cccc', reason: 'a test reason' })]);
  });

  it('counts an advisory once however many packages carry it, and accepts it the same way', () => {
    const same = advisory('GHSA-aaaa-bbbb-cccc', 'high');
    const result = evaluateAudit(report({ picomatch: [same], vite: [same], vitest: [same] }), REVIEWED, TODAY);
    expect(result.failures).toEqual([]);
    expect(result.accepted).toHaveLength(1);
  });

  it('fails once the review window is over, so the decision is looked at again', () => {
    const { failures } = evaluateAudit(
      report({ picomatch: [advisory('GHSA-aaaa-bbbb-cccc', 'high')] }),
      REVIEWED,
      '2026-12-18',
    );
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('GHSA-aaaa-bbbb-cccc');
    expect(failures[0]).toMatch(/review/i);
  });

  it('still accepts on the last day of the window', () => {
    const result = evaluateAudit(
      report({ picomatch: [advisory('GHSA-aaaa-bbbb-cccc', 'high')] }),
      REVIEWED,
      '2026-12-17',
    );
    expect(result.failures).toEqual([]);
  });

  it('fails on a reviewed entry the audit no longer reports, so a fixed advisory is taken off the list', () => {
    const { failures } = evaluateAudit(report({}), REVIEWED, TODAY);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('GHSA-aaaa-bbbb-cccc');
    expect(failures[0]).toMatch(/no longer/i);
  });

  it('fails on a new high advisory next to a reviewed one', () => {
    const { failures, accepted } = evaluateAudit(
      report({
        picomatch: [advisory('GHSA-aaaa-bbbb-cccc', 'high')],
        astro: [advisory('GHSA-dddd-eeee-ffff', 'high', 'astro')],
      }),
      REVIEWED,
      TODAY,
    );
    expect(accepted).toHaveLength(1);
    expect(failures).toEqual([expect.stringContaining('GHSA-dddd-eeee-ffff')]);
  });

  it('fails, rather than passing, on a report it cannot read', () => {
    for (const bad of [
      null,
      undefined,
      {},
      { error: { code: 'ENOTFOUND', summary: 'no network' } },
      'text',
      { vulnerabilities: 5 },
    ]) {
      const { failures } = evaluateAudit(bad as never, [], TODAY);
      expect(failures, JSON.stringify(bad)).toHaveLength(1);
    }
  });

  it('reads an advisory without a url by its source number, never skipping it', () => {
    const noUrl = { source: 1234567, name: 'x', title: 't', severity: 'high', range: '*' };
    const { failures } = evaluateAudit(report({ x: [noUrl] }), [], TODAY);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('1234567');
  });
});

describe('the reviewed advisories file', () => {
  it('has well-formed entries: an advisory id, the package, a reason and a review date', () => {
    for (const entry of REVIEWED_ADVISORIES) {
      expect(entry.id, JSON.stringify(entry)).toMatch(/^GHSA(-[23456789cfghjmpqrvwx]{4}){3}$/);
      expect(entry.package.length).toBeGreaterThan(0);
      expect(entry.reason.length).toBeGreaterThan(20);
      expect(entry.reviewUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(entry.reviewUntil))).toBe(false);
    }
  });

  it('lists no advisory twice', () => {
    const ids = REVIEWED_ADVISORIES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
