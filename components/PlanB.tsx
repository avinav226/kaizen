import { EditableText } from './EditableText';
import { TryAnother } from './TryAnother';

interface Props {
  text: string;
  index: number;
  count: number;
  onEdit: (text: string) => void;
  onTry: () => void;
}

export function PlanB({ text, index, count, onEdit, onTry }: Props) {
  return (
    <div>
      <EditableText text={text} label="Plan B" onSave={onEdit} />
      <div className="mt-2">
        <TryAnother index={index} count={count} label="plan B" onClick={onTry} />
      </div>
    </div>
  );
}
