import { localDate } from './dates';
import type { ISODate } from './types';

const KEY = 'kaizen.debug.clockOffsetDays';

/** Debug-only clock shift. Stays 0 unless the debug menu sets it. */
export function getClockOffsetDays(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(window.localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function setClockOffsetDays(days: number): void {
  try {
    window.localStorage.setItem(KEY, String(days));
  } catch {
    // Storage unavailable: the clock simply stays real.
  }
}

/** The one place the app asks what time it is. */
export function now(): Date {
  return new Date(Date.now() + getClockOffsetDays() * 86_400_000);
}

export function today(timeZone: string): ISODate {
  return localDate(now(), timeZone);
}
