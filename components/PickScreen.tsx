'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMounted } from '@/lib/hooks/useMounted';
import { useOnboarding } from '@/lib/store/onboarding';
import { OnboardingHeader } from './OnboardingHeader';
import { PrimaryButton } from './PrimaryButton';
import { ScreenIntro } from './ScreenIntro';

export function PickScreen() {
  const router = useRouter();
  const mounted = useMounted();
  const items = useOnboarding((s) => s.items);
  const selectedId = useOnboarding((s) => s.selectedId);
  const select = useOnboarding((s) => s.select);

  // Nothing captured yet (e.g. a direct visit): go back to the start.
  useEffect(() => {
    if (mounted && items.length === 0) router.replace('/onboarding');
  }, [mounted, items.length, router]);

  // Preselect the first item so there is always a sensible default.
  useEffect(() => {
    if (mounted && items.length > 0 && !items.some((i) => i.id === selectedId)) select(items[0].id);
  }, [mounted, items, selectedId, select]);

  if (!mounted) return <main className="flex-1" />;

  return (
    <main className="flex flex-1 flex-col">
      <OnboardingHeader step={2} onBack={() => router.push('/onboarding')} />
      <ScreenIntro
        eyebrow="One small start"
        heading="Pick one to start with"
        subtitle="One at a time works best. The rest wait in Later, and nothing gets lost."
      />

      <div role="radiogroup" aria-label="Pick one to start with" className="mt-8 flex flex-col gap-3">
        {items.map((item) => {
          const on = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => select(item.id)}
              className={`flex min-h-14 items-center gap-4 rounded-[16px] border px-5 py-4 text-left ${
                on ? 'border-accent bg-accent-bg-strong shadow-[inset_0_0_0_1px_var(--t-color-accent)]' : 'border-border bg-surface'
              }`}
            >
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                  on ? 'border-accent' : 'border-border-strong'
                }`}
                aria-hidden="true"
              >
                {on && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
              <span className="flex-1">{item.text}</span>
              <span className="text-[13px] text-text-secondary">{on ? 'Start' : 'Later'}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 rounded-[14px] bg-surface-muted p-4 text-text-secondary">
        Not sure? Pick the one that would make the biggest difference and feels easiest to start.
      </p>

      <div className="mt-auto pt-8">
        <p className="mb-4 text-center text-text-secondary">{items.length - 1} waiting in Later</p>
        <PrimaryButton onClick={() => router.push('/onboarding/ladder')}>Start with this one</PrimaryButton>
      </div>
    </main>
  );
}
