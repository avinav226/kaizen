interface Props {
  /** 1-based current step out of `total`. */
  current: number;
  total?: number;
}

/** The current step is a long pill; earlier ones are small indigo dots, later ones small pale dots. */
export function ProgressDots({ current, total = 3 }: Props) {
  return (
    <div role="img" aria-label={`Step ${current} of ${total}`} className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const shape = n === current ? 'w-11 bg-accent' : n < current ? 'w-3 bg-accent' : 'w-3 bg-border';
        return <span key={n} className={`h-1.5 rounded-full ${shape}`} />;
      })}
    </div>
  );
}
