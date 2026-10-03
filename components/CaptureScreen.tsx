'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMounted } from '@/lib/hooks/useMounted';
import { useOnboarding } from '@/lib/store/onboarding';
import { CloseIcon } from './icons/CloseIcon';
import { OnboardingHeader } from './OnboardingHeader';
import { PrimaryButton } from './PrimaryButton';
import { ScreenIntro } from './ScreenIntro';

const SUGGESTIONS = [
  'Move my body every day',
  'Stop scrolling in bed',
  'Save a little each month',
  'Call my parents more',
  'Read before sleeping',
];

export function CaptureScreen() {
  const router = useRouter();
  const mounted = useMounted();
  const items = useOnboarding((s) => s.items);
  const addItem = useOnboarding((s) => s.addItem);
  const removeItem = useOnboarding((s) => s.removeItem);
  const [text, setText] = useState('');
  const [needOne, setNeedOne] = useState(false);

  const list = mounted ? items : [];
  const have = new Set(list.map((i) => i.text.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((s) => !have.has(s.toLowerCase()));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addItem(text);
    setText('');
    setNeedOne(false);
  }

  function next() {
    if (list.length === 0) return setNeedOne(true);
    router.push('/onboarding/pick');
  }

  return (
    <main className="flex flex-1 flex-col">
      <OnboardingHeader step={1} />
      <ScreenIntro
        eyebrow="Kaizen starts with noticing"
        heading="What do you know you should be doing, but aren't?"
        subtitle="List as many as come to mind. We'll pick where to start on the next screen."
      />

      <form onSubmit={submit} className="mt-8">
        <label htmlFor="item" className="text-[15px] font-medium">
          Add something
        </label>
        <div className="mt-3 flex gap-3">
          <input
            id="item"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I should… but I keep…"
            autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-[14px] border border-border bg-surface px-4 outline-none placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-accent"
          />
          <button
            type="submit"
            className="h-12 min-w-[44px] rounded-[14px] border border-accent bg-surface px-5 font-medium text-accent"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="mt-5 flex flex-col gap-3">
        {list.map((item) => (
          <li
            key={item.id}
            className="flex min-h-[50px] items-center gap-3 rounded-[14px] border border-border bg-surface pr-1 pl-4"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <span className="flex-1 py-3">{item.text}</span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.text}`}
              className="flex h-11 w-11 items-center justify-center text-text-secondary"
            >
              <CloseIcon />
            </button>
          </li>
        ))}
      </ul>

      {suggestions.length > 0 && (
        <section className="mt-6" aria-label="Common ones">
          <p className="text-text-secondary">Common ones, tap to add</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addItem(s)}
                className="min-h-11 rounded-full border border-dashed border-border-dashed px-4 py-2 text-text-secondary"
              >
                + {s}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-auto pt-8">
        <p className="mb-4 text-center text-text-secondary" role="status">
          {needOne
            ? 'Add at least one thing to continue'
            : list.length === 0
              ? 'Nothing noted yet'
              : `${list.length} ${list.length === 1 ? 'thing' : 'things'} noted`}
        </p>
        <PrimaryButton onClick={next}>Continue</PrimaryButton>
      </div>
    </main>
  );
}
