import { TryAnother } from './TryAnother';
import { EditableText } from './EditableText';

interface Props {
  label: string;
  meta: string;
  text: string;
  versionIndex: number;
  versionCount: number;
  onEdit: (text: string) => void;
  onTryAnother: () => void;
  highlighted?: boolean;
  children?: React.ReactNode;
}

export function LadderRung({
  label,
  meta,
  text,
  versionIndex,
  versionCount,
  onEdit,
  onTryAnother,
  highlighted,
  children,
}: Props) {
  return (
    <div
      className={`rounded-[16px] border p-5 ${
        highlighted
          ? 'border-accent bg-accent-bg-strong shadow-[inset_0_0_0_1px_var(--t-color-accent)]'
          : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-medium">{label}</h2>
        <span className="text-[13px] text-text-secondary">{meta}</span>
      </div>
      <div className="mt-2">
        <EditableText text={text} label={label} onSave={onEdit} />
      </div>
      <div className="mt-2">
        <TryAnother index={versionIndex} count={versionCount} label={label.toLowerCase()} onClick={onTryAnother} />
      </div>
      {children}
    </div>
  );
}
