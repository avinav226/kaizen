import { addDays } from './dates';
import { isGoodDay } from './goodDays';
import type { Checkin, DateRange, ISODate } from './types';

export interface WelcomeBackState {
  today: ISODate;
  goalStart: ISODate;
  pausedRanges?: readonly DateRange[];
  /** The lapse start the welcome back screen was last shown for, if any. */
  shownForLapse?: ISODate | null;
}

const LAPSE_DAYS = 3;

/**
 * First day of the current run of non-good days ending yesterday, or null if
 * the run is shorter than three days. No check-in and "not today" both count as
 * non-good. Days before the goal started and paused days end the run.
 */
export function lapseStart(checkins: readonly Checkin[], s: WelcomeBackState): ISODate | null {
  const latest = new Map<ISODate, Checkin>();
  for (const c of checkins) latest.set(c.date, c);

  const todays = latest.get(s.today);
  if (todays && isGoodDay(todays.answer)) return null;

  const paused = (d: ISODate) => (s.pausedRanges ?? []).some((r) => d >= r.from && d <= r.to);
  let start: ISODate | null = null;
  let length = 0;
  for (let d = addDays(s.today, -1); d >= s.goalStart; d = addDays(d, -1)) {
    const c = latest.get(d);
    if (paused(d) || (c && isGoodDay(c.answer))) break;
    start = d;
    length += 1;
  }
  return length >= LAPSE_DAYS ? start : null;
}

/** True once per lapse: three days without a good day, and not yet shown for this lapse. */
export function needsWelcomeBack(checkins: readonly Checkin[], s: WelcomeBackState): boolean {
  const start = lapseStart(checkins, s);
  return start !== null && s.shownForLapse !== start;
}
