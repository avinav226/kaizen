import { RefreshIcon } from './icons/RefreshIcon';

interface Props {
  index: number;
  count: number;
  label: string;
  onClick: () => void;
}

export function TryAnother({ index, count, label, onClick }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Try another version of ${label}`}
        className="flex h-11 items-center gap-2 rounded-full border border-accent-border bg-surface px-4 font-medium text-accent"
      >
        <RefreshIcon />
        Try another
      </button>
      <span className="text-[13px] text-text-secondary">
        Version {index + 1} of {count}
      </span>
    </div>
  );
}
