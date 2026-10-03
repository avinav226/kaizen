'use client';

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

const btn = 'min-h-11 rounded-[12px] border border-border-strong bg-surface px-4 text-left';

/** Dev-only tools for testing the app without waiting weeks. Everything acts on your own data. */
export function DebugPanel({ goalId, timezone }: Props) {
  const [offset, setOffset] = useState(() => getClockOffsetDays());
  const [days, setDays] = useState(14);
  const [pattern, setPattern] = useState<SeedPattern>('good');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const today = todayFor(timezone);

  function shiftClock(by: number | null) {
    const next = by === null ? 0 : offset + by;
    setClockOffsetDays(next);
    setOffset(next);
    setMessage(`Clock moved. Today is now ${todayFor(timezone)}.`);
  }

  /** Moves the goal's start back so the history fits, then writes the check-ins. */
  async function seed(n: number, p: SeedPattern, skipLast = 0) {
    setBusy(true);
    const supabase = createClient();
    const start = addDays(today, -n);
    const last = addDays(today, -1 - skipLast);
    try {
      await supabase.from('checkins').delete().eq('goal_id', goalId);
      await supabase.from('goals').update({ started_at: start }).eq('id', goalId);
      const { data: steps } = await supabase.from('steps').select('id').eq('goal_id', goalId).order('active_from').limit(1);
      if (steps?.[0]) await supabase.from('steps').update({ active_from: start }).eq('id', steps[0].id);
      await supabase.from('profiles').update({ onboarded_at: start }).not('id', 'is', null);
      const rows = generateSeed(start, last, p).map((c) => ({ goal_id: goalId, date: c.date, answer: c.answer, note: c.note }));
      if (rows.length) await supabase.from('checkins').insert(rows);
      useCheckins.getState().reset();
      setMessage(`Seeded ${rows.length} days, from ${start} to ${last}.`);
    } catch (e) {
      setMessage(`Something failed: ${String(e)}`);
    }
    setBusy(false);
  }

  async function startFresh() {
    setBusy(true);
    const supabase = createClient();
    const tomorrow = addDays(today, 1);
    await supabase.from('checkins').delete().eq('goal_id', goalId);
    await supabase.from('goals').update({ started_at: tomorrow }).eq('id', goalId);
    const { data: steps } = await supabase.from('steps').select('id').eq('goal_id', goalId).order('active_from').limit(1);
    if (steps?.[0]) await supabase.from('steps').update({ active_from: tomorrow }).eq('id', steps[0].id);
    await supabase.from('profiles').update({ onboarded_at: today }).not('id', 'is', null);
    useCheckins.getState().reset();
    setMessage('Back to a fresh start: the first day is tomorrow.');
    setBusy(false);
  }

  async function clearCheckins() {
    setBusy(true);
    await createClient().from('checkins').delete().eq('goal_id', goalId);
    useCheckins.getState().reset();
    setMessage('All check-ins cleared.');
    setBusy(false);
  }

  function clearLocal() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('kaizen.'))
      .forEach((k) => localStorage.removeItem(k));
    setOffset(0);
    setMessage('Local data cleared. The real clock is back.');
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="font-medium">Clock</h2>
        <p className="mt-1 text-text-secondary">
          Today is {today}
          {offset !== 0 && ` (${offset > 0 ? '+' : ''}${offset} days)`}.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[-1, 1, 3, 7].map((n) => (
            <button key={n} type="button" className={btn} onClick={() => shiftClock(n)}>
              {n > 0 ? '+' : ''}
              {n} {Math.abs(n) === 1 ? 'day' : 'days'}
            </button>
          ))}
          <button type="button" className={`${btn} col-span-2`} onClick={() => shiftClock(null)}>
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
          <button type="button" disabled={busy} className={btn} onClick={() => seed(14, pattern)}>
            Make it day 14 (seed 14 days)
          </button>
          <button type="button" disabled={busy} className={btn} onClick={() => seed(14, 'good', 3)}>
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
        <button type="button" className={btn} onClick={clearLocal}>
          Clear local data on this device
        </button>
      </section>

      {message && (
        <p className="rounded-[14px] bg-accent-bg p-4 text-accent-deep" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
