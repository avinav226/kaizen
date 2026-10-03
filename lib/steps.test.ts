import { describe, expect, it } from 'vitest';
import { stepOn } from './steps';
import type { Step } from './types';

const step = (id: string, from: string, to: string | null): Step => ({
  id, text: id, frequency: 'daily', active_from: from, active_to: to,
});

describe('stepOn', () => {
  const steps = [step('old', '2026-10-01', '2026-10-14'), step('new', '2026-10-15', null)];
  it('picks the step in force on the date', () => {
    expect(stepOn(steps, '2026-10-14')?.id).toBe('old');
    expect(stepOn(steps, '2026-10-15')?.id).toBe('new');
    expect(stepOn(steps, '2026-12-01')?.id).toBe('new');
  });
  it('returns null before any step has started', () => {
    expect(stepOn(steps, '2026-09-30')).toBeNull();
  });
});
