import { addDays, addMonths } from './dates';
import type { Decision, ISODate } from './types';

/** First review 14 days after onboarding, then monthly on the same date. */
export function nextReviewDate(
  onboardedAt: ISODate,
  reviews: readonly { completedAt: string | null }[],
): ISODate {
  const completed = reviews.filter((r) => r.completedAt !== null).length;
  const first = addDays(onboardedAt, 14);
  return completed === 0 ? first : addMonths(first, completed); // from the anchor, so month ends don't drift
}

/** Suggested next step by good-day rate: 60%+ grow, 30 to 60% keep, below 30% shrink. */
export function suggestDecision(goodDays: number, totalDays: number): Decision {
  if (totalDays <= 0) return 'keep';
  const rate = goodDays / totalDays;
  if (rate >= 0.6) return 'grow';
  if (rate >= 0.3) return 'keep';
  return 'shrink';
}
