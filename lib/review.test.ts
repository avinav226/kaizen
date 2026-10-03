import { describe, expect, it } from 'vitest';
import { nextReviewDate, suggestDecision } from './review';

describe('nextReviewDate', () => {
  it('is 14 days after onboarding with no reviews', () => {
    expect(nextReviewDate('2026-10-01', [])).toBe('2026-10-15');
  });
  it('then monthly on the same date', () => {
    expect(nextReviewDate('2026-10-01', [{ completedAt: '2026-10-15' }])).toBe('2026-11-15');
    expect(
      nextReviewDate('2026-10-01', [{ completedAt: 'a' }, { completedAt: 'b' }]),
    ).toBe('2026-12-15');
  });
  it('ignores reviews that were started but not completed', () => {
    expect(nextReviewDate('2026-10-01', [{ completedAt: null }])).toBe('2026-10-15');
  });
  it('does not drift after a short month', () => {
    // First review 2026-01-31; second clamps to Feb 28; third returns to Mar 31.
    expect(nextReviewDate('2026-01-17', [{ completedAt: 'a' }])).toBe('2026-02-28');
    expect(nextReviewDate('2026-01-17', [{ completedAt: 'a' }, { completedAt: 'b' }])).toBe('2026-03-31');
  });
  it('is late (not earlier) if the user reviews after the due date', () => {
    expect(nextReviewDate('2026-10-01', [{ completedAt: '2026-10-20' }])).toBe('2026-11-15');
  });
});

describe('suggestDecision', () => {
  it('grows at 60% or more', () => {
    expect(suggestDecision(9, 14)).toBe('grow'); // 64%
    expect(suggestDecision(6, 10)).toBe('grow'); // exactly 60%
  });
  it('keeps from 30% to below 60%', () => {
    expect(suggestDecision(3, 10)).toBe('keep'); // exactly 30%
    expect(suggestDecision(8, 14)).toBe('keep'); // 57%
  });
  it('shrinks below 30%', () => {
    expect(suggestDecision(4, 14)).toBe('shrink'); // 29%
    expect(suggestDecision(0, 14)).toBe('shrink');
  });
  it('keeps when there are no countable days', () => {
    expect(suggestDecision(0, 0)).toBe('keep');
  });
});
