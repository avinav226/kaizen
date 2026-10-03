import type { Answer } from '@/lib/types';

export type DotStatus = Answer | 'today' | 'none';

const STYLE: Record<DotStatus, string> = {
  done: 'bg-accent',
  partly: 'bg-accent-soft',
  not_today: 'border-[1.5px] border-solid border-border-dashed',
  today: 'border-[1.5px] border-dashed border-accent',
  none: 'bg-surface-sunken',
};

export function StatusDot({ status, size = 28 }: { status: DotStatus; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 rounded-full ${STYLE[status]}`}
    />
  );
}
