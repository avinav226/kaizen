import type { Answer } from '@/lib/types';

const OPTIONS: { answer: Answer; label: string }[] = [
  { answer: 'done', label: 'Done' },
  { answer: 'partly', label: 'Partly' },
  { answer: 'not_today', label: 'Not today' },
];

interface Props {
  value?: Answer;
  onChange: (a: Answer) => void;
}

export function AnswerSwitcher({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="How did today go?" className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3">
      {OPTIONS.map((o) => {
        const on = o.answer === value;
        return (
          <button
            key={o.answer}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.answer)}
            className={`h-[54px] rounded-[16px] border px-1 text-base ${
              on ? 'border-accent bg-accent font-medium text-on-accent' : 'border-border-strong bg-surface text-text'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
