import { areaForGoal, fallbackLadderFor } from './fallbackLadders';
import { isStepTooBig } from './stepSize';

const LAST_RESORT = 'Take one slow breath and think of your step';

/**
 * A smaller step to offer after a hard day. For now it comes from the hand-written
 * ladder for the goal's area: the shortest step that is not the current one.
 * (The AI route will take over this job in a later step.)
 */
export function suggestSmallerStep(goalTitle: string, currentStep: string): string {
  const candidates = fallbackLadderFor(areaForGoal(goalTitle)).step.filter(
    (s) => s.toLowerCase() !== currentStep.trim().toLowerCase() && isStepTooBig(s) === null,
  );
  const shortest = candidates.sort((a, b) => a.split(' ').length - b.split(' ').length)[0];
  return shortest ?? LAST_RESORT;
}
