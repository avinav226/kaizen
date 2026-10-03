'use client';

import { useEffect, useState } from 'react';
import { now as clockNow } from '@/lib/clock';
import { localDate } from '@/lib/dates';
import type { ISODate } from '@/lib/types';

export interface Now {
  date: ISODate;
  time: Date;
}

/** The current local date and time (debug clock aware). Null until mounted; refreshes across midnight. */
export function useNow(timeZone: string): Now | null {
  const [value, setValue] = useState<Now | null>(null);
  useEffect(() => {
    const tick = () => {
      const time = clockNow();
      setValue((prev) => {
        const date = localDate(time, timeZone);
        return prev && prev.date === date && Math.abs(prev.time.getTime() - time.getTime()) < 30_000
          ? prev
          : { date, time };
      });
    };
    tick();
    const id = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timeZone]);
  return value;
}
