import { PlusSquareIcon } from './icons/PlusSquareIcon';
import { ShareIcon } from './icons/ShareIcon';

const STEPS = [
  { icon: <ShareIcon />, text: 'Tap the Share button in your browser' },
  { icon: <PlusSquareIcon />, text: 'Choose Add to Home Screen' },
  { icon: null, text: 'Tap Add, at the top right' },
];

/** The iOS explainer (screen 6b): iOS has no install button, so we show the three taps. */
export function AddToHomeScreen() {
  return (
    <>
      <h1 className="mt-8 font-display text-[28px] leading-[35px] font-medium">Add Kaizen to your home screen</h1>
      <p className="mt-3 text-text-secondary">That&rsquo;s how it can nudge you each day, and it opens like an app.</p>
      <ol className="mt-8 flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={s.text} className="flex items-center gap-4 rounded-[16px] border border-border bg-surface p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-bg font-medium text-accent-deep" aria-hidden="true">
              {i + 1}
            </span>
            <span className="flex-1">{s.text}</span>
            {s.icon && <span className="text-accent">{s.icon}</span>}
          </li>
        ))}
      </ol>
    </>
  );
}
