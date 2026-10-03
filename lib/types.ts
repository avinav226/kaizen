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
