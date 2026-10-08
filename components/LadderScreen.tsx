'use client';

import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { today as todayFor } from '@/lib/clock';
import { useMounted } from '@/lib/hooks/useMounted';
import { requestLadder } from '@/lib/ladderClient';
import { useOnboarding } from '@/lib/store/onboarding';
import { isStepTooBig } from '@/lib/stepSize';
import { debugEnabled } from '@/lib/debug';
import { createClient } from '@/lib/supabase/client';
import { CheckIcon } from './icons/CheckIcon';
import { FrequencyPicker } from './FrequencyPicker';
import { LadderLoading } from './LadderLoading';
import { LadderRung } from './LadderRung';
import { OnboardingHeader } from './OnboardingHeader';
import { PlanB } from './PlanB';
import { PrimaryButton } from './PrimaryButton';
import { ScreenIntro } from './ScreenIntro';

const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export function LadderScreen() {
  const router = useRouter();
  const mounted = useMounted();
  const s = useOnboarding();
  const goal = s.items.find((i) => i.id === s.selectedId);
  const ready = Boolean(s.ladder) && s.ladderFor === s.selectedId;
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<{ expired: boolean; detail: string } | null>(null);

  useEffect(() => {
    if (mounted && !goal) router.replace('/onboarding');
  }, [mounted, goal, router]);

  // Build the ladder when a goal is picked. The loading screen stays up until it is ready.
  useEffect(() => {
    if (!mounted || !goal || ready) return;
    let cancelled = false;
    requestLadder(goal.text, todayFor(timeZone())).then((ladder) => {
      if (!cancelled) useOnboarding.getState().setLadder(goal.id, ladder);
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, goal, ready]);

  if (!mounted || !goal) return <main className="flex-1" />;
  const back = () => router.push('/onboarding/pick');
  if (!ready || !s.ladder) return <LadderLoading goal={goal.text} onBack={back} />;

  const { ladder, version } = s;
  const stepText = ladder.step[version.step];
  const tooBig = isStepTooBig(stepText);

  async function start() {
    if (!s.ladder || !goal) return;
    setSaving(true);
    setFailure(null);
    const tz = timeZone();
    const { error } = await createClient().rpc('complete_onboarding', {
      p_timezone: tz,
      p_today: todayFor(tz),
      p_goals: s.items.map((i) => i.text),
      p_active_index: s.items.findIndex((i) => i.id === goal.id) + 1,
      p_long_term: s.ladder.longTerm[s.version.longTerm],
      p_milestone: s.ladder.milestone[s.version.milestone],
      p_milestone_due: s.ladder.milestoneDue,
      p_plan_b: s.ladder.planB[s.version.planB],
      p_source: s.edited ? 'user' : 'fallback',
      p_step_text: s.ladder.step[s.version.step],
      p_frequency: s.frequency,
    });
    if (error) {
      console.error('complete_onboarding failed', error);
      setSaving(false);
      setFailure({
        // An expired sign-in is the one failure the person can fix, so say so.
        expired: /jwt|not signed in|PGRST301/i.test(`${error.message} ${error.code}`),
        detail: `${error.code ? `${error.code}: ` : ''}${error.message}`,
      });
      return;
    }
    useOnboarding.getState().reset();
    router.replace('/install'); // the one-time home-screen offer; it moves on at once if there is nothing to offer
  }

  const rung = (r: 'longTerm' | 'milestone' | 'step' | 'planB') => ({
    versionIndex: version[r],
    versionCount: ladder[r].length,
    onTryAnother: () => s.cycle(r),
    onEdit: (text: string) => s.editRung(r, text),
  });

  return (
    <main className="flex flex-1 flex-col">
      <OnboardingHeader step={3} onBack={back} />
      <ScreenIntro
        eyebrow={`In your words: ${goal.text}`}
        heading="Here's your ladder"
        subtitle="Written for you from what you wrote. Tap any line to change the words, or try another version."
      />

      <ol className="relative mt-8 flex flex-col gap-4">
        <span aria-hidden="true" className="absolute top-3 bottom-10 left-[10px] w-0.5 bg-border-strong" />

        <li className="grid grid-cols-[22px_1fr] gap-x-4">
          <span aria-hidden="true" className="relative mt-3 h-[22px] w-[22px] rounded-full border-2 border-border-strong bg-background" />
          <LadderRung label="Where you want to be" meta="In a year" text={ladder.longTerm[version.longTerm]} {...rung('longTerm')} />
        </li>

        <li className="grid grid-cols-[22px_1fr] gap-x-4">
          <span aria-hidden="true" className="relative mt-3 h-[22px] w-[22px] rounded-full border-2 border-accent bg-background" />
          <LadderRung
            label="A milestone on the way"
            meta={`By ${format(parseISO(ladder.milestoneDue), 'd MMMM')}`}
            text={ladder.milestone[version.milestone]}
            {...rung('milestone')}
          />
        </li>

        <li className="grid grid-cols-[22px_1fr] gap-x-4">
          <span aria-hidden="true" className="relative mt-3 h-[22px] w-[22px] rounded-full border-2 border-accent bg-accent" />
          <LadderRung label="Your first small step" meta="Starts tomorrow" text={stepText} highlighted {...rung('step')}>
            <div className="mt-4 border-t border-divider pt-4">
              {tooBig ? (
                <div className="flex flex-col items-start gap-3" role="status">
                  <p className="text-text-secondary">{tooBig} A smaller version may be easier to start.</p>
                  <button
                    type="button"
                    onClick={() => s.cycle('step')}
                    className="min-h-11 rounded-full border border-accent px-4 font-medium text-accent"
                  >
                    Make it smaller
                  </button>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-[13px] leading-[18px] text-positive">
                  <CheckIcon />
                  Under two minutes, no preparation needed
                </p>
              )}
              <div className="mt-3">
                <FrequencyPicker value={s.frequency} onChange={s.setFrequency} />
              </div>
            </div>

            <div className="mt-4 border-t border-divider pt-4">
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-clay-bg px-2.5 py-1 text-[12px] leading-[17px] font-medium text-clay">On a bad day</span>
                <span className="text-[12px] leading-[17px] text-text-secondary">Your plan B, ready in advance</span>
              </div>
              <div className="mt-3">
                <PlanB
                  text={ladder.planB[version.planB]}
                  index={version.planB}
                  count={ladder.planB.length}
                  onEdit={(t) => s.editRung('planB', t)}
                  onTry={() => s.cycle('planB')}
                />
              </div>
            </div>
          </LadderRung>
        </li>
      </ol>

      <p className="mt-6 text-[13px] leading-[19px] text-text-secondary">
        Day to day you&rsquo;ll only see the bottom rung. Your check-ins will teach the app what really gets in your way, and the
        plan B gets better from there.
      </p>

      <div className="mt-auto pt-8">
        {failure && (
          <div className="mb-3 text-center" role="alert">
            <p className="text-[13px] text-error">
              {failure.expired ? 'Your sign-in has expired.' : 'We couldn’t save that. Please try again.'}
            </p>
            {failure.expired && (
              <a href="/login" className="mt-1 inline-flex min-h-11 items-center text-accent underline">
                Sign in again
              </a>
            )}
            {debugEnabled && <p className="mt-1 text-[12px] break-words text-text-muted">{failure.detail}</p>}
          </div>
        )}
        <PrimaryButton onClick={start} disabled={saving}>
          {saving ? 'Saving…' : 'Start tomorrow'}
        </PrimaryButton>
      </div>
    </main>
  );
}
