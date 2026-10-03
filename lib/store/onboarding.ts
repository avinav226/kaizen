import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LadderVersions, Rung } from '@/lib/ladder';
import type { Frequency } from '@/lib/types';

export interface Item {
  id: string;
  text: string;
}

type Versions = Record<Rung, number>;

interface OnboardingState {
  items: Item[];
  selectedId: string | null;
  ladder: LadderVersions | null;
  ladderFor: string | null; // goal id the ladder was built for
  version: Versions;
  frequency: Frequency;
  edited: boolean;
  addItem: (text: string) => boolean;
  removeItem: (id: string) => void;
  select: (id: string) => void;
  setLadder: (goalId: string, ladder: LadderVersions) => void;
  cycle: (rung: Rung) => void;
  editRung: (rung: Rung, text: string) => void;
  setFrequency: (f: Frequency) => void;
  reset: () => void;
}

const FRESH_VERSIONS: Versions = { longTerm: 0, milestone: 0, step: 0, planB: 0 };

const initial = {
  items: [] as Item[],
  selectedId: null as string | null,
  ladder: null as LadderVersions | null,
  ladderFor: null as string | null,
  version: FRESH_VERSIONS,
  frequency: 'daily' as Frequency,
  edited: false,
};

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initial,

      // Duplicates (case-insensitive) and blanks are ignored.
      addItem: (raw) => {
        const text = raw.trim();
        if (!text) return false;
        const { items } = get();
        if (items.some((i) => i.text.toLowerCase() === text.toLowerCase())) return false;
        set({ items: [...items, { id: crypto.randomUUID(), text }] });
        return true;
      },

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      select: (id) =>
        set((s) =>
          s.selectedId === id
            ? s
            : { selectedId: id, ladder: null, ladderFor: null, version: FRESH_VERSIONS, edited: false },
        ),

      setLadder: (goalId, ladder) =>
        set({ ladder, ladderFor: goalId, version: FRESH_VERSIONS, edited: false }),

      cycle: (rung) =>
        set((s) => {
          if (!s.ladder) return s;
          const n = s.ladder[rung].length;
          return { version: { ...s.version, [rung]: (s.version[rung] + 1) % n } };
        }),

      // Editing replaces the words of the version currently shown.
      editRung: (rung, text) =>
        set((s) => {
          if (!s.ladder) return s;
          const list = [...s.ladder[rung]];
          list[s.version[rung]] = text;
          return { ladder: { ...s.ladder, [rung]: list }, edited: true };
        }),

      setFrequency: (frequency) => set({ frequency }),

      reset: () => set({ ...initial }),
    }),
    { name: 'kaizen.onboarding', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
