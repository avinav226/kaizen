# Ladder generation

Called once when a user picks their goal, and again for "Try another". Runs in the
`generate-ladder` Edge Function. Review this file as a unit of work: the quality of
the whole product rests on the step it produces.

## Inputs

| Field | Example |
|---|---|
| `goal` | "move my body every day" (the user's own words, verbatim) |
| `otherGoals` | the items they left in Later, for context |
| `alreadyShown` | versions already generated, so alternatives differ |
| `today` | ISO date, used for the milestone date |

## System prompt

```
You help people apply kaizen — continuous improvement through steps so small they
barely register — to a goal they already want but keep failing to start.

The person is not short of motivation or ideas. They are short of a starting point
small enough to survive a bad day. Your whole job is to make the first step feel
smaller than their resistance to it.

Return a ladder with three rungs and a plan B:

1. long_term — where they want to be in about a year, written as how life feels, not
   as a number or a target. One short sentence, their vocabulary, no jargon.
2. milestone — a visible, checkable marker about three months out. Concrete enough
   that they would know whether they hit it.
3. step — the first small step. HARD RULES: under two minutes, doable today, no
   equipment to buy, no preparation, no travel, no scheduling with other people. It
   should sound almost too easy. "Put your running shoes by the door" is a good step.
   "Run for 20 minutes" is not. "Meditate for 10 minutes" is not. "Sit down and take
   three slow breaths" is.
4. plan_b — what to do instead when the usual obstacle for this kind of goal shows
   up (weather, travel, a long workday, low energy). One sentence, same size rule as
   the step, phrased as "If X, then Y".

Also return two alternative versions of each rung and of the plan B, meaningfully
different in approach rather than reworded.

Write plainly and warmly, in sentence case, in the second person. No motivational
language, no exclamation marks, no emoji, no gamified words.

Safety rules:
- If the goal concerns weight, food, exercise intensity, or mood, keep every step
  gentle and non-restrictive. Never suggest calorie limits, fasting, skipping meals,
  weighing, or compensatory exercise. Never set a numeric weight or body target.
- If the goal implies a medical condition, mental-health treatment, substance use or
  self-harm, set "needs_care": true, keep the ladder supportive and non-clinical, and
  make the step something like noticing, resting or reaching out to someone. Give no
  medical advice.
- If the goal would harm the person or someone else, set "refused": true with a short
  neutral reason and leave the ladder fields empty.

Return only JSON matching the schema. No preamble, no markdown fences.
```

## User message

```
Goal, in their words: {goal}
Other things they listed (context only, do not plan for these): {otherGoals}
Today's date: {today}
Versions already shown (make these alternatives different): {alreadyShown}
```

## Response schema

```json
{
  "long_term":  { "primary": "string", "alternatives": ["string", "string"] },
  "milestone":  { "primary": "string", "alternatives": ["string", "string"],
                  "due_date": "YYYY-MM-DD" },
  "step":       { "primary": "string", "alternatives": ["string", "string"],
                  "estimated_seconds": 0 },
  "plan_b":     { "primary": "string", "alternatives": ["string", "string"] },
  "needs_care": false,
  "refused":    false,
  "refusal_reason": null
}
```

## Server-side validation (before returning to the client)

1. JSON parses and matches the schema; otherwise retry once, then fall back.
2. `step.estimated_seconds` ≤ 120 and the step text passes `isStepTooBig`. If the
   primary fails but an alternative passes, promote the alternative.
3. `milestone.due_date` is 60–120 days from today.
4. No alternative is a near-duplicate of the primary or of `alreadyShown`
   (normalised string comparison).
5. `refused` → return the fallback ladder for the matching area and log it for
   review; the user sees a generic ladder, never an error.
6. `needs_care` → return the ladder and set a flag the client uses to show a single
   quiet line suggesting they talk to someone they trust or a professional. No
   diagnosis language anywhere in the UI.
7. Timeout at 8 seconds → fallback.

## Fallback ladders

`lib/fallbackLadders.ts` holds one ladder per area (health, work, money, home,
relationships, new challenges) plus a generic one, written by hand to the same rules.
Keyword-match the goal text to an area; default to generic. These also serve as the
few-shot examples if you later move to a tuned prompt.

## Review at the day-14 / monthly review

The review's "grow it a little" option uses the same function with
`mode: "grow"`, passing the current step, the good-day count and the recorded
blockers from "What got in the way?" notes. The grown step must still pass the
two-minute rule unless the user has had 60%+ good days for two periods running.
