'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { mergeCheckins } from '@/lib/checkinMerge';
import { addDays } from '@/lib/dates';
import { useNow } from '@/lib/hooks/useNow';
import { stepOn } from '@/lib/steps';
import { useCheckins } from '@/lib/store/checkins';
import { syncCheckins } from '@/lib/sync/checkins';
import { periodSummary } from '@/lib/summaries';
import type { Answer, TodayData } from '@/lib/types';
import { AnswerSwitcher } from './AnswerSwitcher';
import { CloseIcon } from './icons/CloseIcon';
import { PrimaryButton } from './PrimaryButton';
import { ResponseCard } from './ResponseCard';
import { WeekStrip } from './WeekStrip';

const ANSWERS: Answer[] = ['done', 'partly', 'not_today'];
const PLACEHOLDER: Record<Answer, string> = {
  done: 'A small win from today…',
  partly: 'What helped, even a little?',
  not_today: 'What got in the way?',
};

export function CheckinScreen({ data }: { data: TodayData }) {
  const router = useRouter();
  const params = useSearchParams();
  const now = useNow(data.timezone);
  const entries = useCheckins((s) => s.entries);
  const hydrate = useCheckins((s) => s.hydrate);
  const record = useCheckins((s) => s.record);

  const [note, setNote] = useState<string | null>(null); // null = not edited yet
  const [saved, setSaved] = useState(false);
  const applied = useRef(false);

  useEffect(() => hydrate(data.goal.id), [hydrate, data]);

  const today = now?.date;
  const start = data.goal.started_at ?? today;
  const step = today ? stepOn(data.steps, today) : null;
  const checkins = today ? mergeCheckins(data.checkins, entries) : [];
  const current = checkins.find((c) => c.date === today);

  function apply(answer: Answer, text: string | null) {
    if (!today) return;
    record(today, answer, text, step?.id ?? null);
    void syncCheckins();
  }

  // A deep link such as /checkin?answer=done is applied straight away, then the
  // parameter is dropped so a reload can never undo a later change of answer.
  useEffect(() => {
    if (!today || !start || applied.current) return;
    if (today < start) {
      router.replace('/today');
      return;
    }
    const wanted = params.get('answer');
    if (wanted && (ANSWERS as string[]).includes(wanted)) {
      applied.current = true;
      const existing = checkins.find((c) => c.date === today);
      apply(wanted as Answer, existing?.note ?? null);
      // Tidy the URL in place. A router navigation would refetch the page and could bring back stale data.
      window.history.replaceState(null, '', '/checkin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, start, params]);

  if (!now || !today || !start || today < start) return <main className="flex-1" />;

  const week = periodSummary(checkins, addDays(today, -6), today, { today, goalStart: start });
  const text = note ?? current?.note ?? '';
  const answer = current?.answer;

  function choose(a: Answer) {
    setSaved(false);
    apply(a, text.trim() || null);
  }

  function save() {
    if (!answer) return;
    apply(answer, text.trim() || null);
    setSaved(true);
  }

  return (
    <main className="flex flex-1 flex-col gap-6 pb-6">
      <header className="flex items-center justify-between">
        <p className="text-text-secondary">{format(now.time, 'EEEE · h:mm aaa')}</p>
        <Link href="/today" aria-label="Close" className="-mr-3 flex h-11 w-11 items-center justify-center">
          <CloseIcon />
        </Link>
      </header>

      <div>
        <p className="text-text-secondary">Today&rsquo;s small step</p>
        <h1 className="mt-3 font-display text-[28px] leading-[35px] font-medium">{step?.text}</h1>
      </div>

      <WeekStrip days={week.days} />

      <section aria-label="Today">
        <p className="mb-3 text-text-secondary">Today</p>
        <AnswerSwitcher value={answer} onChange={choose} />
      </section>

      {answer && (
        <>
          <ResponseCard
            answer={answer}
            weekGood={week.good}
            weekDays={week.totalDays}
            planB={data.planB}
            goalId={data.goal.id}
            goalTitle={data.goal.title}
            stepText={step?.text ?? ''}
            today={today}
          />

          <div>
            <label htmlFor="note" className="font-medium">
              One line about today <span className="font-normal text-text-secondary">(optional)</span>
            </label>
            <input
              id="note"
              value={text}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved(false);
              }}
              onBlur={() => text.trim() !== (current?.note ?? '') && apply(answer, text.trim() || null)}
              placeholder={PLACEHOLDER[answer]}
              autoComplete="off"
              className="mt-3 h-12 w-full rounded-[14px] border border-border bg-surface px-4 outline-none placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-accent"
            />
          </div>

          <div className="mt-auto pt-4">
            {saved ? (
              <>
                <p className="mb-3 text-center text-positive" role="status">
                  Saved. See you tomorrow.
                </p>
                <Link
                  href="/today"
                  className="flex h-[54px] w-full items-center justify-center rounded-full border border-accent font-medium text-accent"
                >
                  Back to today
                </Link>
              </>
            ) : (
              <PrimaryButton onClick={save}>Save</PrimaryButton>
            )}
          </div>
        </>
      )}
    </main>
  );
}
