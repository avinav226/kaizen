import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Answer, ISODate } from '@/lib/types';
import type { LocalEntry } from '@/lib/checkinMerge';

export interface Entry extends LocalEntry {
  stepId: string | null;
  /** When the server confirmed this entry. Recent ones stay on screen even if a stale server copy arrives. */
  syncedAt?: number;
}

/** How long a confirmed entry outranks fresh server data (covers reads that started before the save landed). */
const RECENT_MS = 120_000;

interface CheckinState {
  goalId: string | null;
  /** The user's own writes, shown immediately and kept until the next server load. */
  entries: Record<ISODate, Entry>;
  /** Dates not yet confirmed by the server, with the version that was last written. */
  pending: Record<ISODate, number>;
  versions: Record<ISODate, number>;
  /** Fresh server data arrived: drop confirmed local entries, keep unsynced ones. */
  hydrate: (goalId: string, keepSynced?: boolean) => void;
  record: (date: ISODate, answer: Answer, note: string | null, stepId: string | null) => void;
  markSynced: (date: ISODate, version: number) => void;
  reset: () => void;
}

const empty = { goalId: null, entries: {}, pending: {}, versions: {} };

export const useCheckins = create<CheckinState>()(
  persist(
    (set) => ({
      ...empty,

      // Offline, the server copy is only a saved snapshot, so everything done on this device stays.
      hydrate: (goalId, keepSynced = false) =>
        set((s) => {
          if (s.goalId !== goalId) return { ...empty, goalId };
          const entries: Record<ISODate, Entry> = {};
          for (const [date, e] of Object.entries(s.entries)) {
            const recent = e.syncedAt !== undefined && Date.now() - e.syncedAt < RECENT_MS;
            if (date in s.pending || recent || keepSynced) entries[date] = e;
          }
          return { entries };
        }),

      record: (date, answer, note, stepId) =>
        set((s) => {
          const version = (s.versions[date] ?? 0) + 1;
          return {
            entries: { ...s.entries, [date]: { answer, note, stepId } }, // no syncedAt until confirmed
            versions: { ...s.versions, [date]: version },
            pending: { ...s.pending, [date]: version },
          };
        }),

      // Only clear the flag if nothing newer was written while the request was in flight.
      markSynced: (date, version) =>
        set((s) => {
          if (s.pending[date] !== version) return s;
          const pending = Object.fromEntries(Object.entries(s.pending).filter(([d]) => d !== date));
          const entry = s.entries[date];
          return { pending, entries: entry ? { ...s.entries, [date]: { ...entry, syncedAt: Date.now() } } : s.entries };
        }),

      reset: () => set({ ...empty }),
    }),
    { name: 'kaizen.checkins', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
