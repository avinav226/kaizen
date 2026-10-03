import type { Answer, Checkin } from './types';

/** Done and partly are good days. Not today is not, and is never an error. */
export function isGoodDay(answer: Answer): boolean {
  return answer === 'done' || answer === 'partly';
}

/** Cumulative good days. One per calendar date, never resets. */
export function countGoodDays(checkins: readonly Checkin[]): number {
  const latest = new Map<string, Answer>();
  for (const c of checkins) latest.set(c.date, c.answer); // last answer of the day wins
  let n = 0;
  for (const answer of latest.values()) if (isGoodDay(answer)) n += 1;
  return n;
}
