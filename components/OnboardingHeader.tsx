import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { LogoRing } from './icons/LogoRing';
import { ProgressDots } from './ProgressDots';

interface Props {
  step: number;
  onBack?: () => void;
}

export function OnboardingHeader({ step, onBack }: Props) {
  return (
    <header className="flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-text"
        >
          <ArrowLeftIcon />
        </button>
      ) : (
        <span className="flex h-11 w-11 items-center text-text">
          <LogoRing />
        </span>
      )}
      <ProgressDots current={step} />
    </header>
  );
}
