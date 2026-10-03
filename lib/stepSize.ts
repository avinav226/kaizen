const MAX_SECONDS = 120;

const UNIT_SECONDS: Record<string, number> = {
  s: 1, sec: 1, secs: 1, second: 1, seconds: 1,
  m: 60, min: 60, mins: 60, minute: 60, minutes: 60,
  h: 3600, hr: 3600, hrs: 3600, hour: 3600, hours: 3600,
};

const DURATION = /(\d+(?:\.\d+)?)(?:\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|[smh])\b/gi;

const EQUIPMENT_OR_PREP =
  /\b(buy|purchase|equipment|gear|prepare|preparation|prep|set up|schedule|drive|travel|commute|shopping|gym|book (?:a|an|your|the)|order (?:a|an|some|your|the))\b/i;

/**
 * Returns a gentle reason if the step is bigger than two minutes or needs
 * preparation or equipment, otherwise null. Used for a nudge, never a block.
 */
export function isStepTooBig(text: string): string | null {
  const t = text.toLowerCase();

  let longest = 0;
  for (const m of t.matchAll(DURATION)) {
    const unit = UNIT_SECONDS[m[3]];
    const amount = Math.max(Number(m[1]), m[2] ? Number(m[2]) : 0);
    longest = Math.max(longest, amount * unit);
  }
  if (/\b(half an hour|an hour|a couple of hours)\b/.test(t)) longest = Math.max(longest, 1800);

  if (longest > MAX_SECONDS) return 'This looks longer than two minutes.';
  if (EQUIPMENT_OR_PREP.test(t)) return 'This might need some preparation or equipment.';
  return null;
}
