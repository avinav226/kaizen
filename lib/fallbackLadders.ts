import { addDays } from './dates';
import type { ISODate } from './types';
import type { LadderVersions } from './ladder';

export type Area = 'health' | 'work' | 'money' | 'home' | 'relationships' | 'challenges' | 'generic';

type AreaLadder = Omit<LadderVersions, 'milestoneDue'>;

/**
 * One hand-written ladder per area, to the same rules as the AI prompt:
 * the step takes under two minutes, needs no preparation or equipment, and the
 * plan B is "If X, then Y". Each rung has three versions.
 */
const LADDERS: Record<Area, AreaLadder> = {
  health: {
    longTerm: [
      'Feel strong and full of energy in your body',
      'Move because it feels good, not because you have to',
      'Wake up rested and ready for the day',
    ],
    milestone: [
      'Move your body on most days of the week',
      'Notice that moving gets easier to start',
      'Feel more energy in the afternoons',
    ],
    step: [
      'Put your walking shoes by the door',
      'Stand up and stretch your arms for 30 seconds',
      'Take three slow breaths and roll your shoulders',
    ],
    planB: [
      "If it's raining or you're tired, then stand and stretch for 30 seconds.",
      "If you're away from home, then walk to the end of the room and back.",
      'If today is packed, then roll your shoulders three times.',
    ],
  },
  work: {
    longTerm: [
      "Do work you're proud of without dreading the start",
      'Finish what matters without last-minute stress',
      'End the workday feeling you moved things forward',
    ],
    milestone: [
      'Start your most important task before anything else, most days',
      'Have one meaningful task done each day',
      'Begin each work session within a minute of sitting down',
    ],
    step: [
      "Open the document you've been avoiding",
      'Write the first sentence of your next task',
      'Write down the one thing to start with tomorrow',
    ],
    planB: [
      'If your day fills up, then open the document and read the first line.',
      'If you feel stuck, then write one rough sentence and stop.',
      "If meetings take over, then write down tomorrow's first task.",
    ],
  },
  money: {
    longTerm: [
      'Feel calm and in control about money',
      'Have a cushion that makes surprises smaller',
      'Know where your money goes without worrying',
    ],
    milestone: [
      'Move a small amount into savings each month',
      'Check your balance once a week without dread',
      'Have a first small buffer set aside',
    ],
    step: [
      'Open your banking app and look at your balance',
      'Move one small amount into savings',
      'Write down one thing you bought today',
    ],
    planB: [
      "If it's a tight week, then just open the app and look.",
      "If you've forgotten, then move the smallest amount you can.",
      "If today is busy, then write down today's spending tomorrow morning.",
    ],
  },
  home: {
    longTerm: [
      'Come home to a space that feels calm',
      'Find what you need without searching',
      'Enjoy your home instead of managing it',
    ],
    milestone: [
      'Keep one surface clear most days',
      'Have one tidy spot you love in your home',
      'Do a short reset of the main room most evenings',
    ],
    step: [
      'Put one thing back where it belongs',
      'Clear one item off the kitchen counter',
      'Pick up one piece of clutter and drop it in its place',
    ],
    planB: [
      "If you're tired, then put away just one item.",
      "If you have guests, then clear only the spot you're standing in.",
      "If you're out all day, then straighten one thing when you walk in.",
    ],
  },
  relationships: {
    longTerm: [
      'Feel close to the people who matter to you',
      'Be someone who keeps in touch easily',
      'Know your people feel cared for, and so do you',
    ],
    milestone: [
      'Be in touch with someone you care about every week',
      'Have one regular call or message you look forward to',
      'Reach out to a different person each week',
    ],
    step: [
      'Send one person a short message saying hi',
      'Think of one person you miss and open their chat',
      'Write down one person you want to reach out to',
    ],
    planB: [
      "If you don't know what to say, then send a photo or a simple hello.",
      "If you're short on energy, then just open their chat and read the last message.",
      "If the day runs away, then jot down who you'll message tomorrow.",
    ],
  },
  challenges: {
    longTerm: [
      'Enjoy getting better at something new',
      'Feel proud of a skill you started from scratch',
      'Be someone who tries new things and keeps going',
    ],
    milestone: [
      'Practise in small bits on most days of the week',
      "Be able to do one small thing you couldn't before",
      'Feel comfortable starting a session without effort',
    ],
    step: [
      'Write down one thing you want to learn first',
      'Look up one beginner tip about it',
      "Say out loud what you'd like to learn",
    ],
    planB: [
      "If you're not in the mood, then read one line about it.",
      "If you can't practise today, then picture yourself doing it for 30 seconds.",
      'If time is short, then do just the first tiny part.',
    ],
  },
  generic: {
    longTerm: [
      'Feel good about how you spend your days',
      'Be someone who follows through, gently',
      'Feel calm about this part of your life',
    ],
    milestone: [
      'Do a small piece of this most days',
      'Notice it getting easier to begin',
      "Have a simple routine you'd miss if it stopped",
    ],
    step: [
      'Write down the very first action you would take',
      'Put a note about it where you will see it',
      'Take a moment to picture the first tiny action',
    ],
    planB: [
      'If today is hard, then just think of the first tiny action.',
      "If you're busy, then write one word about it.",
      "If you've forgotten, then start again tomorrow with the same step.",
    ],
  },
};

/** Checked in order, so the more specific areas come first. */
const KEYWORDS: [Exclude<Area, 'generic'>, RegExp][] = [
  ['challenges', /\b(swim|guitar|piano|language|hobby|paint|draw|instrument|sing|dance|new skill)\b|\blearn(?:ing)? to\b/i],
  ['money', /\b(save|saving|savings|money|budget|spend|spending|debt|invest|bills?)\b/i],
  ['home', /\b(home|house|clean|tidy|declutter|laundry|dishes|room|organi[sz]e)\b/i],
  ['relationships', /\b(call|parents?|friends?|family|partner|text|relationship|mom|dad|visit)\b/i],
  ['work', /\b(work|job|careers?|projects?|emails?|inbox|deadline|study|exam|focus|procrastinat\w*)\b/i],
  ['health', /\b(move|body|exercise|walk|run|gym|sleep|bed|scroll\w*|eat|food|diet|water|health|fit|stretch|yoga)\b/i],
];

export function areaForGoal(goal: string): Area {
  return KEYWORDS.find(([, re]) => re.test(goal))?.[0] ?? 'generic';
}

export function getFallbackLadder(goal: string, today: ISODate): LadderVersions {
  const l = LADDERS[areaForGoal(goal)];
  return {
    longTerm: [...l.longTerm],
    milestone: [...l.milestone],
    step: [...l.step],
    planB: [...l.planB],
    milestoneDue: addDays(today, 90),
  };
}

export const FALLBACK_AREAS = Object.keys(LADDERS) as Area[];
export const fallbackLadderFor = (area: Area): AreaLadder => LADDERS[area];
