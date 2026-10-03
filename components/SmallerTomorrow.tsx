'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addDays } from '@/lib/dates';
import { suggestSmallerStep } from '@/lib/smallerStep';
import { createClient } from '@/lib/supabase/client';
import type { ISODate } from '@/lib/types';

interface Props {
  goalId: string;
  goalTitle: string;
  currentStep: string;
  today: ISODate;
}

type State = 'closed' | 'open' | 'saving' | 'done' | 'failed';

/** Offered on a "Not today" day. Accepting swaps in a smaller step from tomorrow. */
export function SmallerTomorrow({ goalId, goalTitle, currentStep, today }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>('closed');
  const smaller = suggestSmallerStep(goalTitle, currentStep);

  async function accept() {
    setState('saving');
    const { error } = await createClient().rpc('replace_step', {
      p_goal_id: goalId,
      p_text: smaller,
      p_from: addDays(today, 1),
    });
    if (error) {
      console.error('replace_step failed', error);
      setState('failed');
      return;
    }
    setState('done');
    router.refresh();
  }

  if (state === 'done') {
    return (
      <p className="mt-4 rounded-[14px] bg-surface p-4" role="status">
        Done. Tomorrow&rsquo;s step is smaller: <span className="font-display">{smaller}</span>
      </p>
    );
  }

  if (state === 'closed') {
    return (
      <button
        type="button"
        onClick={() => setState('open')}
        aria-expanded={false}
        className="mt-4 min-h-[52px] rounded-full border border-border-strong bg-surface px-5 text-base"
      >
        Make tomorrow smaller?
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-[14px] bg-surface p-4">
      <p className="text-text-secondary">Tomorrow&rsquo;s step could be:</p>
      <p className="mt-2 font-display text-xl leading-[26px]">{smaller}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={accept}
          disabled={state === 'saving'}
          className="min-h-11 rounded-full bg-accent px-5 font-medium text-on-accent disabled:opacity-60"
        >
          {state === 'saving' ? 'Saving…' : 'Use this tomorrow'}
        </button>
        <button
          type="button"
          onClick={() => setState('closed')}
          className="min-h-11 rounded-full border border-border-strong px-5"
        >
          Keep my step
        </button>
      </div>
      {state === 'failed' && (
        <p className="mt-3 text-[13px] text-error" role="alert">
          We couldn&rsquo;t save that. Please try again.
        </p>
      )}
    </div>
  );
}
