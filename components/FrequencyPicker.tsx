import type { Frequency } from '@/lib/types';

const OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'three_times', label: '3 times' },
];

interface Props {
  value: Frequency;
  onChange: (f: Frequency) => void;
}

export function FrequencyPicker({ value, onChange }: Props) {
  return (
    <div>
      <p id="frequency-label" className="text-text-secondary">
        How often? Your call.
      </p>
      <div role="radiogroup" aria-labelledby="frequency-label" className="mt-3 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
        {OPTIONS.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={`h-11 rounded-[12px] border px-1 text-[14px] font-medium ${
                on ? 'border-accent bg-accent text-on-accent' : 'border-border bg-surface text-text'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
