import { describe, expect, it } from 'vitest';
import { mergeCheckins } from './checkinMerge';

describe('mergeCheckins', () => {
  it('lets local entries win and keeps dates sorted', () => {
    const merged = mergeCheckins(
      [{ date: '2026-10-02', answer: 'done', note: 'a' }, { date: '2026-10-04', answer: 'done' }],
      { '2026-10-02': { answer: 'not_today', note: 'rain' }, '2026-10-03': { answer: 'partly', note: null } },
    );
    expect(merged.map((c) => [c.date, c.answer])).toEqual([
      ['2026-10-02', 'not_today'],
      ['2026-10-03', 'partly'],
      ['2026-10-04', 'done'],
    ]);
    expect(merged[0].note).toBe('rain');
  });
});
