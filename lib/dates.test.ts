import { describe, expect, it } from 'vitest';
import { addDays, addMonths, daysBetween, eachDay, localDate } from './dates';

describe('localDate', () => {
  const instant = new Date('2026-10-03T23:30:00Z');
  it('rolls over to the next day east of UTC', () => {
    expect(localDate(instant, 'Asia/Kolkata')).toBe('2026-10-04');
  });
  it('stays on the same day in UTC', () => {
    expect(localDate(instant, 'UTC')).toBe('2026-10-03');
  });
  it('rolls back west of UTC', () => {
    expect(localDate(new Date('2026-10-03T02:00:00Z'), 'America/Los_Angeles')).toBe('2026-10-02');
  });
});

describe('date math', () => {
  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('is stable across a DST change', () => {
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
  it('clamps month ends', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
  });
  it('counts and lists days inclusively', () => {
    expect(daysBetween('2026-10-01', '2026-10-15')).toBe(14);
    expect(eachDay('2026-10-01', '2026-10-03')).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
    expect(eachDay('2026-10-03', '2026-10-01')).toEqual([]);
  });
});
