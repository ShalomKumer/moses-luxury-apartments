import { describe, expect, it } from 'vitest';
import { knownResult, parseAvailabilityResult, withFreshness } from '@domain/availability/availability-result';
import { nightStatus, stayStatus } from '@domain/availability/night-status';

const updatedAt = new Date('2026-11-01T10:00:00Z');
const known = knownResult(['2026-11-05', '2026-11-06'], '2026-11-01', '2026-12-01', updatedAt);

describe('night and stay status', () => {
  it('says free, taken, or unknown outside the reading', () => {
    expect(nightStatus(known, '2026-11-04')).toBe('free');
    expect(nightStatus(known, '2026-11-05')).toBe('taken');
    expect(nightStatus(known, '2026-12-01')).toBe('unknown');
  });

  it('never says free when the reading is unknown (H7)', () => {
    expect(nightStatus({ status: 'unknown', reason: 'calendar_unavailable' }, '2026-11-04')).toBe('unknown');
  });

  it('rates a whole stay by its worst night', () => {
    expect(stayStatus(known, '2026-11-02', '2026-11-05')).toBe('free');
    expect(stayStatus(known, '2026-11-04', '2026-11-06')).toBe('taken');
    expect(stayStatus(known, '2026-11-29', '2026-12-02')).toBe('unknown');
    expect(stayStatus(known, '2026-11-04', '2026-11-04')).toBe('unknown');
  });
});

describe('freshness', () => {
  it('turns an old reading into unknown, stale (H7)', () => {
    const hourLater = new Date('2026-11-01T11:00:00Z');
    expect(withFreshness(known, hourLater, 2 * 60 * 60 * 1000)).toBe(known);
    expect(withFreshness(known, hourLater, 30 * 60 * 1000)).toEqual({ status: 'unknown', reason: 'stale' });
  });
});

describe('parseAvailabilityResult', () => {
  it('accepts a well-formed result', () => {
    expect(parseAvailabilityResult(JSON.parse(JSON.stringify(known)))).toEqual(known);
  });

  it('turns anything malformed into unknown', () => {
    expect(parseAvailabilityResult(null).status).toBe('unknown');
    expect(parseAvailabilityResult({ ...known, takenNights: ['not-a-date'] }).status).toBe('unknown');
    expect(parseAvailabilityResult({ status: 'unknown', reason: 'something' }).status).toBe('unknown');
  });
});
