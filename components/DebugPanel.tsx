'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getClockOffsetDays, setClockOffsetDays, today as todayFor } from '@/lib/clock';
import { addDays } from '@/lib/dates';
import { generateSeed, type SeedPattern } from '@/lib/debugSeed';
import { useCheckins } from '@/lib/store/checkins';
import { createClient } from '@/lib/supabase/client';

interface Props {
  goalId: string;
  timezone: string;
}

const btn = 'min-h-11 rounded-[12px] border border-border-strong bg-surface px-4 text-left disabled:opacity-50';

/** Dev-only tools for testing the app without waiting weeks. Everything acts on your own data. */
export function DebugPanel({ goalId, timezone }: Props) {
  const [offset, setOffset] = useState(() => getClockOffsetDays());
  const [days, setDays] = useState(14);
  const [pattern, setPattern] = useState<SeedPattern>('good');
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  /** Shows "Working…" at once, then the result. The message stays pinned on screen. */
  async function run(label: string, work: () => Promise<string>) {
    setBusy(true);
    setMessage(`${label}…`);
    try {
      setMessage(await work());
      router.refresh();
    } catch (e) {
      setMessage(`Something went wrong: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  }

  const today = todayFor(timezone);

  function shiftClock(by: number | null) {
    const next = by === null ? 0 : offset + by;
    setClockOffsetDays(next);
    setOffset(next);
    setMessage(by === null ? `Clock reset. Today is ${todayFor(timezone)}.` : `Clock moved ${by > 0 ? 'forward' : 'back'} ${Math.abs(by)} ${Math.abs(by) === 1 ? 'day' : 'days'}. Today is now ${todayFor(timezone)}.`);
    router.refresh();
  }

  /** Moves the goal's start back so the history fits, then writes the check-ins. */
  function seed(n: number, p: SeedPattern, skipLast = 0, label = `Seeding ${n} days`) {
    return run(label, async () => {
      const supabase = createClient();
      const start = addDays(today, -n);
      const last = addDays(today, -1 - skipLast);
      const fail = (step: string, error: { message: string } | null) => {
        if (error) throw new Error(`${step}: ${error.message}`);
      };
      fail('clearing check-ins', (await supabase.from('checkins').delete().eq('goal_id', goalId)).error);
      fail('moving the start', (await supabase.from('goals').update({ started_at: start }).eq('id', goalId)).error);
      const { data: steps } = await supabase.from('steps').select('id').eq('goal_id', goalId).order('active_from').limit(1);
      if (steps?.[0]) fail('moving the step', (await supabase.from('steps').update({ active_from: start }).eq('id', steps[0].id)).error);
      fail('moving onboarding', (await supabase.from('profiles').update({ onboarded_at: start }).not('id', 'is', null)).error);
      const rows = generateSeed(start, last, p).map((c) => ({ goal_id: goalId, date: c.date, answer: c.answer, note: c.note }));
      if (rows.length) fail('saving check-ins', (await supabase.from('checkins').insert(rows)).error);
      useCheckins.getState().reset();
      return `Done. Seeded ${rows.length} days, ${start} to ${last}. Open Today to see them.`;
    });
  }

  function startFresh() {
    return run('Starting fresh', async () => {
      const supabase = createClient();
      const tomorrow = addDays(today, 1);
      await supabase.from('checkins').delete().eq('goal_id', goalId);
      await supabase.from('goals').update({ started_at: tomorrow }).eq('id', goalId);
      const { data: steps } = await supabase.from('steps').select('id').eq('goal_id', goalId).order('active_from').limit(1);
      if (steps?.[0]) await supabase.from('steps').update({ active_from: tomorrow }).eq('id', steps[0].id);
      await supabase.from('profiles').update({ onboarded_at: today }).not('id', 'is', null);
      useCheckins.getState().reset();
      return 'Done. The first day is tomorrow again.';
    });
  }

  function clearCheckins() {
    return run('Clearing check-ins', async () => {
      const { error } = await createClient().from('checkins').delete().eq('goal_id', goalId);
      if (error) throw new Error(error.message);
      useCheckins.getState().reset();
      return 'Done. All check-ins cleared.';
    });
  }

  function clearLocal() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('kaizen.'))
      .forEach((k) => localStorage.removeItem(k));
    setOffset(0);
    setMessage('Done. Local data cleared and the real clock is back.');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8 pb-28">
      <section>
        <h2 className="font-medium">Clock</h2>
        <p className="mt-1 text-text-secondary">
          Today is {today}
          {offset !== 0 && ` (${offset > 0 ? '+' : ''}${offset} days)`}.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[-1, 1, 3, 7].map((n) => (
            <button key={n} type="button" disabled={busy} className={btn} onClick={() => shiftClock(n)}>
              {n > 0 ? '+' : ''}
              {n} {Math.abs(n) === 1 ? 'day' : 'days'}
            </button>
          ))}
          <button type="button" disabled={busy} className={`${btn} col-span-2`} onClick={() => shiftClock(null)}>
            Back to real time
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-medium">Seed history</h2>
        <p className="mt-1 text-text-secondary">Replaces all check-ins and moves the start back so they fit.</p>
        <div className="mt-3 flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-[13px] text-text-secondary">
            Days
            <input
              type="number" min={1} max={120} value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
              className="h-11 rounded-[12px] border border-border bg-surface px-3 text-base text-text"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-[13px] text-text-secondary">
            Pattern
            <select
              value={pattern} onChange={(e) => setPattern(e.target.value as SeedPattern)}
              className="h-11 rounded-[12px] border border-border bg-surface px-3 text-base text-text"
            >
              <option value="good">Mostly good</option>
              <option value="mixed">Mixed</option>
              <option value="rough">Rough</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          <button type="button" disabled={busy} className={btn} onClick={() => seed(days, pattern)}>
            Seed {days} days
          </button>
          <button type="button" disabled={busy} className={btn} onClick={() => seed(14, pattern, 0, 'Making it day 14')}>
            Make it day 14 (seed 14 days)
          </button>
          <button type="button" disabled={busy} className={btn} onClick={() => seed(14, 'good', 3, 'Simulating three missed days')}>
            Simulate three missed days
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Reset</h2>
        <button type="button" disabled={busy} className={btn} onClick={startFresh}>
          Fresh start (first day tomorrow)
        </button>
        <button type="button" disabled={busy} className={btn} onClick={clearCheckins}>
          Clear all check-ins
        </button>
        <button type="button" disabled={busy} className={btn} onClick={clearLocal}>
          Clear local data on this device
        </button>
      </section>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[var(--t-layout-max-width)] px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
          <p
            className="pointer-events-auto rounded-[14px] border border-accent-border bg-accent-bg p-4 text-accent-deep"
            role="status"
            aria-live="polite"
          >
            {busy && <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent align-[-1px]" aria-hidden="true" />}
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
