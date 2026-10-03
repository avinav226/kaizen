interface Props {
  eyebrow: string;
  heading: string;
  subtitle?: string;
}

export function ScreenIntro({ eyebrow, heading, subtitle }: Props) {
  return (
    <div className="mt-8">
      <p className="text-[13px] leading-[18px] tracking-wide text-text-secondary">{eyebrow}</p>
      <h1 className="mt-3 font-display text-[28px] leading-[35px] font-medium">{heading}</h1>
      {subtitle && <p className="mt-3 text-text-secondary">{subtitle}</p>}
    </div>
  );
}
