import { createClient } from '@/lib/supabase/client';
import { useCheckins } from '@/lib/store/checkins';

let syncing = false;

/**
 * Sends unsynced check-ins to Supabase. Safe to call any time: it does nothing
 * when there is nothing pending, and quietly stops on a network error so the
 * next call (reconnect, app open, next tap) can try again. Upserts are keyed on
 * (goal, date), so retries never create duplicates.
 */
export async function syncCheckins(): Promise<void> {
  if (syncing) return;
  syncing = true;
  try {
    for (;;) {
      const { goalId, entries, pending } = useCheckins.getState();
      const dates = Object.keys(pending);
      if (!goalId || dates.length === 0) return;

      for (const date of dates) {
        const entry = entries[date];
        const version = pending[date];
        const { error } = await createClient()
          .from('checkins')
          .upsert(
            { goal_id: goalId, step_id: entry.stepId, date, answer: entry.answer, note: entry.note },
            { onConflict: 'goal_id,date' },
          );
        if (error) return;
        useCheckins.getState().markSynced(date, version);
      }
    }
  } catch {
    // Offline or request failed: leave everything pending.
  } finally {
    syncing = false;
  }
}
