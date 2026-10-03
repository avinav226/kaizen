import { addDays, daysBetween, eachDay } from './dates';
import { isGoodDay } from './goodDays';
import type { Answer, Checkin, DateRange, ISODate } from './types';

export interface SummaryOptions {
  today: ISODate;
  /** First day of the goal. Earlier days are not part of the period. */
  goalStart?: ISODate;
  /** Paused stretches. These days are not counted as missed. */
  pausedRanges?: readonly DateRange[];
}

export interface DayStatus {
  date: ISODate;
  answer: Answer | null;
  note: string | null;
  isToday: boolean;
  isFuture: boolean;
  /** True when the day is outside the goal (before it started) or paused. */
  excluded: boolean;
}

export interface PeriodSummary {
  days: DayStatus[];
  good: number;
  logged: number;
  /** Days that count towards the period: started, not paused, not in the future. */
  totalDays: number;
}

const inRange = (d: ISODate, r: DateRange) => d >= r.from && d <= r.to;

export function periodSummary(
  checkins: readonly Checkin[],
  from: ISODate,
  to: ISODate,
  opts: SummaryOptions,
): PeriodSummary {
  const byDate = new Map<ISODate, Checkin>();
  for (const c of checkins) byDate.set(c.date, c); // last answer of the day wins

  const days: DayStatus[] = eachDay(from, to).map((date) => {
    const c = byDate.get(date);
    const isFuture = date > opts.today;
    const beforeStart = opts.goalStart !== undefined && date < opts.goalStart;
    const paused = (opts.pausedRanges ?? []).some((r) => inRange(date, r));
    return {
      date,
      answer: c?.answer ?? null,
      note: c?.note ?? null,
      isToday: date === opts.today,
      isFuture,
      excluded: beforeStart || paused,
    };
  });

  const counted = days.filter((d) => !d.isFuture && !d.excluded);
  return {
    days,
    good: counted.filter((d) => d.answer !== null && isGoodDay(d.answer)).length,
    logged: counted.filter((d) => d.answer !== null).length,
    totalDays: counted.length,
  };
}

export function weekSummary(
  checkins: readonly Checkin[],
  weekStart: ISODate,
  opts: SummaryOptions,
): PeriodSummary {
  return periodSummary(checkins, weekStart, addDays(weekStart, 6), opts);
}

export { daysBetween };
