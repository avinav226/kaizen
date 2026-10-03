import { describe, expect, it } from 'vitest';
import { periodSummary, weekSummary } from './summaries';
import type { Checkin } from './types';

const ci = (date: string, answer: Checkin['answer'], note?: string): Checkin => ({ date, answer, note });

describe('weekSummary', () => {
  const week = '2026-10-05'; // Monday
  const checkins = [ci('2026-10-05', 'done'), ci('2026-10-06', 'not_today', 'rain'), ci('2026-10-07', 'partly')];

  it('counts good and logged days, and excludes the future', () => {
    const s = weekSummary(checkins, week, { today: '2026-10-08' });
    expect(s.days).toHaveLength(7);
    expect(s.good).toBe(2);
    expect(s.logged).toBe(3);
    expect(s.totalDays).toBe(4); // Mon to Thu; Thursday is today and not yet logged
    expect(s.days[1].note).toBe('rain');
    expect(s.days[3]).toMatchObject({ isToday: true, answer: null });
    expect(s.days[4].isFuture).toBe(true);
  });

  it('handles a goal created mid-week', () => {
    const s = weekSummary(checkins, week, { today: '2026-10-08', goalStart: '2026-10-07' });
    expect(s.days[0].excluded).toBe(true);
    expect(s.days[1].excluded).toBe(true);
    expect(s.totalDays).toBe(2); // Wed and Thu
  });
});

describe('periodSummary', () => {
  it('excludes paused days from the total', () => {
    const s = periodSummary([ci('2026-10-01', 'done')], '2026-10-01', '2026-10-14', {
      today: '2026-10-14',
      pausedRanges: [{ from: '2026-10-05', to: '2026-10-11' }],
    });
    expect(s.totalDays).toBe(7);
    expect(s.good).toBe(1);
  });

  it('counts check-ins made on a paused day as logged only if the day is counted', () => {
    const s = periodSummary([ci('2026-10-06', 'done')], '2026-10-05', '2026-10-07', {
      today: '2026-10-07',
      pausedRanges: [{ from: '2026-10-05', to: '2026-10-06' }],
    });
    expect(s.good).toBe(0);
    expect(s.totalDays).toBe(1);
  });

  it('gives a full 14 day period for a review', () => {
    const all = Array.from({ length: 14 }, (_, i) => ci(`2026-10-${String(i + 1).padStart(2, '0')}`, i % 2 ? 'done' : 'not_today'));
    const s = periodSummary(all, '2026-10-01', '2026-10-14', { today: '2026-10-15' });
    expect(s.totalDays).toBe(14);
    expect(s.good).toBe(7);
  });
});
