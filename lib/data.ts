import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Answer, Checkin, Step, TodayData } from '@/lib/types';

/** Everything the Today and Check-in screens need. Redirects when onboarding is unfinished. */
export async function loadToday(): Promise<TodayData> {
  const supabase = await createClient();

  const { data: goal } = await supabase
    .from('goals')
    .select('id, title, started_at, status')
    .eq('status', 'active')
    .maybeSingle();
  if (!goal) redirect('/onboarding');

  const [profile, steps, ladder, checkins, later, reviews] = await Promise.all([
    supabase.from('profiles').select('timezone, onboarded_at').single(),
    supabase.from('steps').select('id, text, frequency, active_from, active_to').eq('goal_id', goal.id).order('active_from'),
    supabase.from('ladders').select('plan_b').eq('goal_id', goal.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('checkins').select('date, answer, note').eq('goal_id', goal.id),
    supabase.from('goals').select('id, title').eq('status', 'later').order('created_at'),
    supabase.from('reviews').select('id').eq('goal_id', goal.id).not('completed_at', 'is', null),
  ]);

  return {
    timezone: profile.data?.timezone ?? 'UTC',
    // The goal is the source of truth for being onboarded; the profile date only feeds the review countdown.
    onboardedAt: profile.data?.onboarded_at ?? goal.started_at ?? new Date().toISOString().slice(0, 10),
    goal: { id: goal.id, title: goal.title, started_at: goal.started_at, status: 'active' },
    steps: (steps.data ?? []) as Step[],
    planB: ladder.data?.[0]?.plan_b ?? null,
    checkins: (checkins.data ?? []).map(
      (c): Checkin => ({ date: c.date, answer: c.answer as Answer, note: c.note }),
    ),
    later: later.data ?? [],
    completedReviews: reviews.data?.length ?? 0,
  };
}
