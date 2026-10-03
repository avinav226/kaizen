export type Answer = 'done' | 'partly' | 'not_today';
export type Frequency = 'daily' | 'weekdays' | 'three_times';

/** ISO calendar date in the user's local timezone, e.g. "2026-10-03". */
export type ISODate = string;

export interface Checkin {
  date: ISODate;
  answer: Answer;
  note?: string | null;
}

export interface DateRange {
  from: ISODate;
  to: ISODate;
}

export type Decision = 'grow' | 'keep' | 'shrink';

export interface Step {
  id: string;
  text: string;
  frequency: Frequency;
  active_from: ISODate;
  active_to: ISODate | null;
}

export interface Goal {
  id: string;
  title: string;
  started_at: ISODate | null;
  status: 'active' | 'later' | 'dropped' | 'done';
}

export interface TodayData {
  timezone: string;
  onboardedAt: ISODate;
  goal: Goal;
  steps: Step[];
  planB: string | null;
  checkins: Checkin[];
  later: { id: string; title: string }[];
  completedReviews: number;
}
