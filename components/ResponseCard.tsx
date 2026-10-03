import { lower, numberWord } from '@/lib/format';
import type { Answer } from '@/lib/types';
import { SmallerTomorrow } from './SmallerTomorrow';

interface Props {
  answer: Answer;
  weekGood: number;
  weekDays: number;
  planB: string | null;
  goalId: string;
  goalTitle: string;
  stepText: string;
  today: string;
}

export function ResponseCard({ answer, weekGood, weekDays, planB, goalId, goalTitle, stepText, today }: Props) {
  if (answer === 'not_today') {
    return (
      <section className="rounded-[18px] bg-surface-muted p-5" aria-live="polite">
        <h2 className="font-display text-2xl leading-[30px] font-medium">That&rsquo;s okay. Tomorrow is fresh.</h2>
        <p className="mt-3 text-text-secondary">
          One missed day doesn&rsquo;t undo the week.
          {planB ? ' Your plan B is ready if it helps:' : ''}
        </p>
        {planB && (
          <p className="mt-4 flex items-start gap-3 rounded-[14px] bg-surface p-3 pl-4">
            <span className="mt-0.5 shrink-0 rounded-full bg-positive-bg px-2.5 py-0.5 text-[12px] leading-[17px] font-medium text-positive">
              Plan B
            </span>
            <span>{planB}</span>
          </p>
        )}
        <SmallerTomorrow goalId={goalId} goalTitle={goalTitle} currentStep={stepText} today={today} />
      </section>
    );
  }

  const done = answer === 'done';
  return (
    <section className="rounded-[18px] bg-positive-bg p-5 text-positive" aria-live="polite">
      <h2 className="font-display text-2xl leading-[30px] font-medium text-positive-deep">
        {done ? 'Nice. Step done.' : 'Partly still counts.'}
      </h2>
      <p className="mt-3">
        {done
          ? `${numberWord(weekGood)} ${weekGood === 1 ? 'day' : 'days'} out of ${lower(numberWord(weekDays))} this week. Small steps are adding up.`
          : 'Showing up is the habit. The minutes will follow.'}
      </p>
    </section>
  );
}
