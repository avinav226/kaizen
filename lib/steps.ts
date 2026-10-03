import type { ISODate, Step } from './types';

/** The step in force on `date`: the latest one that has started and not yet ended. */
export function stepOn(steps: readonly Step[], date: ISODate): Step | null {
  const live = steps.filter((s) => s.active_from <= date && (s.active_to === null || s.active_to >= date));
  return live.sort((a, b) => b.active_from.localeCompare(a.active_from))[0] ?? null;
}
