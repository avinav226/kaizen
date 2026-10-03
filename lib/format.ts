import { format, parseISO } from 'date-fns';
import type { ISODate } from './types';

export function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

/** "Six" for 6; plain digits above ten. Capitalised, for the start of a sentence. */
export function numberWord(n: number): string {
  return n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
}

export const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

export const longDate = (d: ISODate): string => format(parseISO(d), 'EEEE, d MMMM');
export const weekdayInitial = (d: ISODate): string => format(parseISO(d), 'EEEEE');
