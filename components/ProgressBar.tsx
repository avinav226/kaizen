export function ProgressBar({ value, max, tone = 'track' }: { value: number; max: number; tone?: 'track' | 'onGreen' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={`h-2 overflow-hidden rounded-full ${tone === 'onGreen' ? 'bg-positive-border/30' : 'bg-surface-sunken'}`}
    >
      <div className="h-full rounded-full bg-positive-border" style={{ width: `${pct}%` }} />
    </div>
  );
}
