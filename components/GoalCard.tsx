import Link from 'next/link';
import type { Answer } from '@/lib/types';
import { ProgressBar } from './ProgressBar';
import { StatusDot } from './StatusDot';

const OPTIONS: { answer: Answer; label: string }[] = [
  { answer: 'done', label: 'Done' },
  { answer: 'partly', label: 'Partly' },
  { answer: 'not_today', label: 'Not today' },
];
const LOGGED: Record<Answer, string> = { done: 'Done today', partly: 'Partly done today', not_today: 'Not today' };

interface Props {
  goalTitle: string;
  stepText: string;
  /** Today's logged answer, if any. */
  answer?: Answer;
  /** False before the first day: there is nothing to check in yet. */
  started: boolean;
  goodDays: number;
  totalDays: number;
}

export function GoalCard({ goalTitle, stepText, answer, started, goodDays, totalDays }: Props) {
  return (
    <section className="rounded-[18px] border border-border bg-surface p-5" aria-label="Today's step">
      <p className="text-text-secondary">{goalTitle}</p>
      <h2 className="mt-2 font-display text-2xl leading-[30px] font-medium">{stepText}</h2>

      {!started ? (
        <p className="mt-5 text-text-secondary">Your first day is tomorrow. Nothing to do today.</p>
      ) : answer ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="flex items-center gap-3 font-medium">
            <StatusDot status={answer} size={20} />
            {LOGGED[answer]}
          </p>
          <Link
            href="/checkin"
            className="flex h-11 items-center rounded-full border border-accent-border px-4 font-medium text-accent"
          >
            Change
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-5 text-text-secondary">How did today go?</p>
          <div className="mt-3 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3">
            {OPTIONS.map((o) => (
              <Link
                key={o.answer}
                href={`/checkin?answer=${o.answer}`}
                className="flex h-[52px] items-center justify-center rounded-[14px] border border-border-strong bg-surface px-1 text-center text-base"
              >
                {o.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {started && (
        <div className="mt-5 border-t border-divider pt-4">
          <ProgressBar value={goodDays} max={totalDays} />
          <p className="mt-3 text-text-secondary">
            {goodDays} good {goodDays === 1 ? 'day' : 'days'} out of {totalDays}
          </p>
        </div>
      )}
    </section>
  );
}
