'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { mergeCheckins } from '@/lib/checkinMerge';
import { daysBetween } from '@/lib/dates';
import { debugEnabled } from '@/lib/debug';
import { greeting, longDate } from '@/lib/format';
import { useNow } from '@/lib/hooks/useNow';
import { nextReviewDate } from '@/lib/review';
import { stepOn } from '@/lib/steps';
import { useCheckins } from '@/lib/store/checkins';
import { periodSummary } from '@/lib/summaries';
import type { TodayData } from '@/lib/types';
import { LogoRing } from './icons/LogoRing';
import { GoalCard } from './GoalCard';
import { LaterList } from './LaterList';
import { ReviewCountdownCard } from './ReviewCountdownCard';

export function TodayScreen({ data }: { data: TodayData }) {
  const now = useNow(data.timezone);
  const entries = useCheckins((s) => s.entries);
  const hydrate = useCheckins((s) => s.hydrate);

  useEffect(() => hydrate(data.goal.id), [hydrate, data]);

  if (!now) return <main className="flex-1" />;

  const today = now.date;
  const start = data.goal.started_at ?? today;
  const started = today >= start;
  const checkins = mergeCheckins(data.checkins, entries);
  const todays = checkins.find((c) => c.date === today);
  const step = stepOn(data.steps, today) ?? stepOn(data.steps, start) ?? data.steps[0];

  const summary = periodSummary(checkins, start, today, { today, goalStart: start });
  const reviewDate = nextReviewDate(
    data.onboardedAt,
    Array.from({ length: data.completedReviews }, () => ({ completedAt: 'done' })),
  );

  return (
    <main className="flex flex-1 flex-col gap-4 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-text-secondary">
            {longDate(today)}
            {started && ` · Day ${daysBetween(start, today) + 1}`}
          </p>
          <h1 className="mt-1 font-display text-[28px] leading-[35px] font-medium">{greeting(now.time.getHours())}</h1>
        </div>
        <span className="mt-1 text-text" aria-hidden="true">
          <LogoRing />
        </span>
      </header>

      <GoalCard
        goalTitle={data.goal.title}
        stepText={step?.text ?? ''}
        answer={todays?.answer}
        started={started}
        goodDays={summary.good}
        totalDays={summary.totalDays}
      />
      <ReviewCountdownCard daysUntil={daysBetween(today, reviewDate)} first={data.completedReviews === 0} />
      <LaterList items={data.later} />

      <div className="mt-auto flex items-center justify-between pt-8">
        {debugEnabled ? (
          <Link href="/debug" className="text-[13px] text-text-muted underline">
            Debug menu
          </Link>
        ) : (
          <span />
        )}
        <form action="/auth/signout" method="post">
          <button type="submit" className="min-h-11 px-2 text-[13px] text-text-muted underline">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
