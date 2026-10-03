import { describe, expect, it } from 'vitest';
import { generateSeed } from './debugSeed';
import { countGoodDays } from './goodDays';

describe('generateSeed', () => {
  it('covers every day once and is repeatable', () => {
    const a = generateSeed('2026-09-01', '2026-09-30', 'mixed');
    expect(a).toHaveLength(30);
    expect(new Set(a.map((c) => c.date)).size).toBe(30);
    expect(generateSeed('2026-09-01', '2026-09-30', 'mixed')).toEqual(a);
  });
  it('produces more good days for better patterns', () => {
    const good = countGoodDays(generateSeed('2026-01-01', '2026-03-31', 'good'));
    const rough = countGoodDays(generateSeed('2026-01-01', '2026-03-31', 'rough'));
    expect(good).toBeGreaterThan(60);
    expect(rough).toBeLessThan(30);
  });
  it('is empty when the range is reversed', () => {
    expect(generateSeed('2026-09-05', '2026-09-01', 'good')).toEqual([]);
  });
});
