import { describe, expect, it } from 'vitest';
import { FALLBACK_AREAS, areaForGoal, fallbackLadderFor, getFallbackLadder } from './fallbackLadders';
import { isStepTooBig } from './stepSize';

describe('areaForGoal', () => {
  it.each([
    ['Move my body every day', 'health'],
    ['Stop scrolling in bed', 'health'],
    ['Save a little each month', 'money'],
    ['Call my parents more', 'relationships'],
    ['Learn to swim', 'challenges'],
    ['Clean out the garage', 'home'],
    ['Reply to emails on time', 'work'],
    ['Be a better person', 'generic'],
  ])('"%s" -> %s', (goal, area) => {
    expect(areaForGoal(goal)).toBe(area);
  });
});

describe('fallback ladders', () => {
  it('has three versions of every rung in every area', () => {
    for (const area of FALLBACK_AREAS) {
      const l = fallbackLadderFor(area);
      for (const rung of [l.longTerm, l.milestone, l.step, l.planB]) expect(rung).toHaveLength(3);
    }
  });

  it('keeps every step and plan B under the two-minute rule', () => {
    for (const area of FALLBACK_AREAS) {
      const l = fallbackLadderFor(area);
      for (const text of [...l.step, ...l.planB]) expect(isStepTooBig(text), text).toBeNull();
    }
  });

  it('writes plan Bs as "If X, then Y"', () => {
    for (const area of FALLBACK_AREAS) {
      for (const text of fallbackLadderFor(area).planB) expect(text).toMatch(/^If .+, then .+\.$/);
    }
  });

  it('sets the milestone about 90 days out and returns copies', () => {
    const a = getFallbackLadder('move', '2026-10-03');
    expect(a.milestoneDue).toBe('2027-01-01');
    a.step[0] = 'changed';
    expect(getFallbackLadder('move', '2026-10-03').step[0]).not.toBe('changed');
  });
});
