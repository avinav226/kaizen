import { eachDay } from './dates';
import type { Answer, Checkin, ISODate } from './types';

export type SeedPattern = 'good' | 'mixed' | 'rough';

/** Chance that a day is a good day (done or partly) for each pattern. */
const GOOD_RATE: Record<SeedPattern, number> = { good: 0.75, mixed: 0.5, rough: 0.2 };

const NOTES: Record<Answer, string[]> = {
  done: ['Walked to the lake', 'Felt easy today', 'Did it before breakfast'],
  partly: ['Only a couple of minutes', 'Got started at least'],
  not_today: ['Too tired', 'Rainy day', 'Busy at work', 'Forgot until bedtime'],
};

/** Small deterministic random number generator, so seeded history is repeatable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Check-ins for every day from `from` to `to`, for testing reviews and welcome back. */
export function generateSeed(from: ISODate, to: ISODate, pattern: SeedPattern, seed = 1): Checkin[] {
  const rand = mulberry32(seed);
  const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)];
  return eachDay(from, to).map((date) => {
    const good = rand() < GOOD_RATE[pattern];
    const answer: Answer = good ? (rand() < 0.75 ? 'done' : 'partly') : 'not_today';
    return { date, answer, note: rand() < 0.3 ? pick(NOTES[answer]) : null };
  });
}
