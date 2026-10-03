function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </svg>
  );
}

interface Props {
  daysUntil: number;
  first: boolean;
}

export function ReviewCountdownCard({ daysUntil, first }: Props) {
  const which = first ? 'first' : 'next';
  return (
    <aside className="flex items-start gap-3 rounded-[18px] bg-accent-bg p-5 text-accent-deep">
      <span className="mt-0.5 shrink-0">
        <CalendarIcon />
      </span>
      <p>
        {daysUntil > 0
          ? `Your ${which} review is in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}. You'll see how it went${first ? ' and pick a reward' : ''}.`
          : 'Your review is ready whenever you are.'}
      </p>
    </aside>
  );
}
