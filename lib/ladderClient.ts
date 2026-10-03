import { getFallbackLadder } from './fallbackLadders';
import type { LadderVersions } from './ladder';
import type { ISODate } from './types';

const MIN_DISPLAY_MS = 1200;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Builds the ladder for a goal. For now this always uses the hand-written
 * fallbacks (the AI route arrives in a later step). The loading screen shows
 * for at least 1.2s, because a flash reads as broken.
 */
export async function requestLadder(goal: string, today: ISODate): Promise<LadderVersions> {
  const [ladder] = await Promise.all([Promise.resolve(getFallbackLadder(goal, today)), sleep(MIN_DISPLAY_MS)]);
  return ladder;
}
