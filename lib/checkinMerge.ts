import type { Checkin, ISODate } from './types';

export interface LocalEntry {
  answer: Checkin['answer'];
  note: string | null;
}

/** Local entries (the user's latest taps) override what the server last told us. */
export function mergeCheckins(server: readonly Checkin[], local: Record<ISODate, LocalEntry>): Checkin[] {
  const byDate = new Map<ISODate, Checkin>(server.map((c) => [c.date, c]));
  for (const [date, e] of Object.entries(local)) byDate.set(date, { date, answer: e.answer, note: e.note });
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
