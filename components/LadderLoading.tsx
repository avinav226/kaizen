import { OnboardingHeader } from './OnboardingHeader';
import { ScreenIntro } from './ScreenIntro';

export function LadderLoading({ goal, onBack }: { goal: string; onBack: () => void }) {
  return (
    <main className="flex flex-1 flex-col">
      <OnboardingHeader step={3} onBack={onBack} />
      <ScreenIntro
        eyebrow={`In your words: ${goal}`}
        heading="Building your ladder"
        subtitle="Breaking your goal into something so small it barely changes your day."
      />
      <div className="mt-8 flex flex-col gap-4" aria-hidden="true">
        {[
          ['w-2/5', 'w-4/5'],
          ['w-1/3', 'w-11/12'],
          ['w-1/4', 'w-3/4'],
        ].map(([a, b], i) => (
          <div key={i} className="ml-9 rounded-[16px] border border-border bg-surface p-5">
            <div className={`h-3 rounded-full bg-surface-sunken ${a}`} />
            <div className={`mt-3 h-5 rounded-full bg-surface-sunken ${b}`} />
          </div>
        ))}
      </div>
      <p className="mt-8 text-text-secondary" role="status">
        Usually takes a few seconds
      </p>
    </main>
  );
}
