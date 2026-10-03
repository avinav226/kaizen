import { describe, expect, it } from 'vitest';
import { greeting, longDate, numberWord, weekdayInitial } from './format';

describe('format', () => {
  it('greets by hour', () => {
    expect([greeting(7), greeting(13), greeting(21)]).toEqual(['Good morning', 'Good afternoon', 'Good evening']);
  });
  it('spells small numbers', () => {
    expect(numberWord(6)).toBe('Six');
    expect(numberWord(0)).toBe('No');
    expect(numberWord(12)).toBe('12');
  });
  it('formats dates', () => {
    expect(longDate('2026-10-03')).toBe('Saturday, 3 October');
    expect(weekdayInitial('2026-10-03')).toBe('S');
  });
});
