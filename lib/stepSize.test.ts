import { describe, expect, it } from 'vitest';
import { isStepTooBig } from './stepSize';

describe('isStepTooBig', () => {
  it.each([
    'Put your running shoes by the door',
    'Sit down and take three slow breaths',
    'Write one sentence',
    'Stretch for 30 seconds',
    'Walk around the room for 2 minutes',
    'Open your book to the first page',
  ])('accepts "%s"', (text) => {
    expect(isStepTooBig(text)).toBeNull();
  });

  it.each([
    'Run for 20 minutes',
    'Meditate for 10 min',
    'Read for an hour',
    'Walk 1-3 minutes',
    'Spend half an hour tidying',
    'Do 2 hours of deep work',
  ])('flags duration in "%s"', (text) => {
    expect(isStepTooBig(text)).toMatch(/two minutes/);
  });

  it.each([
    'Go to the gym',
    'Buy a yoga mat',
    'Prepare your lunch for tomorrow',
    'Drive to the park',
    'Book a class',
  ])('flags preparation or equipment in "%s"', (text) => {
    expect(isStepTooBig(text)).toMatch(/preparation or equipment/);
  });
});
