import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Answer, ISODate } from '@/lib/types';
import type { LocalEntry } from '@/lib/checkinMerge';

export interface Entry extends LocalEntry {
  stepId: string | null;
}

interface CheckinState {
  goalId: string | null;
  /** The user's own writes, shown immediately and kept until the next server load. */
  entries: Record<ISODate, Entry>;
  /** Dates not yet confirmed by the server, with the version that was last written. */
  pending: Record<ISODate, number>;
  versions: Record<ISODate, number>;
  /** Fresh server data arrived: drop confirmed local entries, keep unsynced ones. */
  hydrate: (goalId: string) => void;
  record: (date: ISODate, answer: Answer, note: string | null, stepId: string | null) => void;
  markSynced: (date: ISODate, version: number) => void;
  reset: () => void;
}

const empty = { goalId: null, entries: {}, pending: {}, versions: {} };

export const useCheckins = create<CheckinState>()(
  persist(
    (set) => ({
      ...empty,

      hydrate: (goalId) =>
        set((s) => {
          if (s.goalId !== goalId) return { ...empty, goalId };
          const entries: Record<ISODate, Entry> = {};
          for (const date of Object.keys(s.pending)) entries[date] = s.entries[date];
          return { entries };
        }),

      record: (date, answer, note, stepId) =>
        set((s) => {
          const version = (s.versions[date] ?? 0) + 1;
          return {
            entries: { ...s.entries, [date]: { answer, note, stepId } },
            versions: { ...s.versions, [date]: version },
            pending: { ...s.pending, [date]: version },
          };
        }),

      // Only clear the flag if nothing newer was written while the request was in flight.
      markSynced: (date, version) =>
        set((s) => {
          if (s.pending[date] !== version) return s;
          const pending = Object.fromEntries(Object.entries(s.pending).filter(([d]) => d !== date));
          return { pending };
        }),

      reset: () => set({ ...empty }),
    }),
    { name: 'kaizen.checkins', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
