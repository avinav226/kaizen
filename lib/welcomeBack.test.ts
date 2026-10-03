import { describe, expect, it } from 'vitest';
import { lapseStart, needsWelcomeBack } from './welcomeBack';
import type { Checkin } from './types';

const ci = (date: string, answer: Checkin['answer']): Checkin => ({ date, answer });
const base = { today: '2026-10-10', goalStart: '2026-10-01' };

describe('needsWelcomeBack', () => {
  it('is true after three days with no check-in', () => {
    expect(needsWelcomeBack([ci('2026-10-06', 'done')], base)).toBe(true);
  });
  it('is true when the last three days are all not_today', () => {
    const c = [ci('2026-10-07', 'not_today'), ci('2026-10-08', 'not_today'), ci('2026-10-09', 'not_today')];
    expect(needsWelcomeBack(c, base)).toBe(true);
  });
  it('is true for a mix of missed and not_today', () => {
    expect(needsWelcomeBack([ci('2026-10-08', 'not_today')], base)).toBe(true);
  });
  it('is false with only two missed days', () => {
    expect(needsWelcomeBack([ci('2026-10-07', 'done')], base)).toBe(false);
  });
  it('is false if any of the last three days was good', () => {
    expect(needsWelcomeBack([ci('2026-10-08', 'partly')], base)).toBe(false);
  });
  it('is false if today already has a good check-in', () => {
    expect(needsWelcomeBack([ci('2026-10-10', 'done')], base)).toBe(false);
  });
  it('does not count days before the goal started', () => {
    expect(needsWelcomeBack([], { today: '2026-10-03', goalStart: '2026-10-02' })).toBe(false);
    expect(needsWelcomeBack([], { today: '2026-10-05', goalStart: '2026-10-02' })).toBe(true);
  });
  it('is false while paused', () => {
    expect(
      needsWelcomeBack([], { ...base, pausedRanges: [{ from: '2026-10-07', to: '2026-10-16' }] }),
    ).toBe(false);
  });
  it('shows once per lapse, including the following days', () => {
    const c = [ci('2026-10-06', 'done')];
    const start = lapseStart(c, base);
    expect(start).toBe('2026-10-07');
    expect(needsWelcomeBack(c, { ...base, shownForLapse: start })).toBe(false);
    expect(needsWelcomeBack(c, { ...base, today: '2026-10-11', shownForLapse: start })).toBe(false);
  });
  it('shows again for a new lapse after a good day', () => {
    const c = [ci('2026-10-06', 'done'), ci('2026-10-11', 'done')];
    const first = lapseStart(c.slice(0, 1), base);
    expect(
      needsWelcomeBack(c, { ...base, today: '2026-10-15', shownForLapse: first }),
    ).toBe(true);
  });
});
