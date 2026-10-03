import { addDays as addDaysFns, addMonths as addMonthsFns, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { ISODate } from './types';

/** The calendar date at `now` in `timeZone`. A day runs to local midnight. */
export function localDate(now: Date, timeZone: string): ISODate {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const toDate = (d: ISODate): Date => parseISO(d);
const toISO = (d: Date): ISODate => format(d, 'yyyy-MM-dd');

export const addDays = (d: ISODate, n: number): ISODate => toISO(addDaysFns(toDate(d), n));
export const addMonths = (d: ISODate, n: number): ISODate => toISO(addMonthsFns(toDate(d), n));
export const daysBetween = (from: ISODate, to: ISODate): number =>
  differenceInCalendarDays(toDate(to), toDate(from));

/** Every date from `from` to `to`, inclusive. Empty if `to` is before `from`. */
export function eachDay(from: ISODate, to: ISODate): ISODate[] {
  const n = daysBetween(from, to);
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => addDays(from, i));
}
