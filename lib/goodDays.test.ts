import { describe, expect, it } from 'vitest';
import { countGoodDays, isGoodDay } from './goodDays';

describe('isGoodDay', () => {
  it('counts done and partly', () => {
    expect(isGoodDay('done')).toBe(true);
    expect(isGoodDay('partly')).toBe(true);
  });
  it('does not count not_today', () => {
    expect(isGoodDay('not_today')).toBe(false);
  });
});

describe('countGoodDays', () => {
  it('is cumulative and ignores gaps', () => {
    expect(
      countGoodDays([
        { date: '2026-10-01', answer: 'done' },
        { date: '2026-10-02', answer: 'not_today' },
        { date: '2026-10-09', answer: 'partly' },
      ]),
    ).toBe(2);
  });
  it('uses the last answer of the day', () => {
    expect(
      countGoodDays([
        { date: '2026-10-01', answer: 'not_today' },
        { date: '2026-10-01', answer: 'done' },
      ]),
    ).toBe(1);
    expect(
      countGoodDays([
        { date: '2026-10-01', answer: 'done' },
        { date: '2026-10-01', answer: 'not_today' },
      ]),
    ).toBe(0);
  });
  it('is zero for no check-ins', () => {
    expect(countGoodDays([])).toBe(0);
  });
});
