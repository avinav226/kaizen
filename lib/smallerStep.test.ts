import { describe, expect, it } from 'vitest';
import { suggestSmallerStep } from './smallerStep';
import { isStepTooBig } from './stepSize';

describe('suggestSmallerStep', () => {
  it('never returns the current step and always passes the two-minute rule', () => {
    for (const goal of ['Move my body', 'Save money', 'Call mum', 'Clean the house', 'Be better']) {
      const current = suggestSmallerStep(goal, 'x');
      const next = suggestSmallerStep(goal, current);
      expect(next).not.toBe(current);
      expect(isStepTooBig(next)).toBeNull();
    }
  });
});
