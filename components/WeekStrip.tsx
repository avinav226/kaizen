import { weekdayInitial } from '@/lib/format';
import type { DayStatus } from '@/lib/summaries';
import { StatusDot, type DotStatus } from './StatusDot';

function statusOf(d: DayStatus): DotStatus {
  if (d.answer) return d.answer;
  return d.isToday ? 'today' : 'none';
}

const LEGEND: { status: DotStatus; label: string }[] = [
  { status: 'done', label: 'Done' },
  { status: 'partly', label: 'Partly' },
  { status: 'not_today', label: 'Not that day' },
];

export function WeekStrip({ days }: { days: DayStatus[] }) {
  return (
    <section aria-label="This week">
      <p className="text-text-secondary">This week</p>
      <ol className="mt-3 flex justify-between">
        {days.map((d) => (
          <li key={d.date} className="flex w-11 flex-col items-center gap-2">
            <StatusDot status={statusOf(d)} size={28} />
            <span className={`text-[13px] ${d.isToday ? 'font-semibold text-text' : 'text-text-secondary'}`}>
              {d.isToday ? 'Today' : weekdayInitial(d.date)}
            </span>
          </li>
        ))}
      </ol>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-text-secondary">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-2 text-[13px]">
            <StatusDot status={l.status} size={14} />
            {l.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
