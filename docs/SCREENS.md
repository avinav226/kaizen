# Screen specs

Twelve screens, in flow order. Each maps to a PNG in `design/`. Copy below is the
real copy; use it as written unless a value is dynamic (shown in `{braces}`).

---

## 1. Capture everything  (`design/01-capture.png`)

**Purpose:** get everything out of the user's head. Naming problems is cheap; this
should feel like relief, not a test.

- Heading: "What do you know you should be doing, but aren't?"
- Subtitle: "List as many as come to mind. We'll pick where to start on the next screen."
- Text field + Add button; Enter also adds. Each item is removable.
- Dashed suggestion chips ("Move my body every day", "Stop scrolling in bed", "Save a
  little each month", "Call my parents more", "Read before sleeping"). Tapping adds;
  an added suggestion disappears from the list.
- Footer counter: "{n} things noted", or "Nothing noted yet".
- Continue is disabled-by-behaviour: with zero items it shows "Add at least one thing
  to continue" inline rather than being greyed out.

**Accepts:** any number of items, no cap. Duplicates (case-insensitive) are ignored.

---

## 2. Pick one  (`design/02-pick.png`)

**Purpose:** one goal, chosen by the user. This is the only prioritisation step.

- Heading: "Pick one to start with"
- Subtitle: "One at a time works best. The rest wait in Later, and nothing gets lost."
- Radio list of their items. Selected item tagged "Start", the others "Later".
- Hint card: "Not sure? Pick the one that would make the biggest difference and feels
  easiest to start."
- Footer: "{n} waiting in Later" + "Start with this one".

**Writes:** chosen goal `status = active`, the rest `status = later`.

---

## 3a. Building your ladder  (`design/03a-ladder-loading.png`)

- Eyebrow: "In your words: {goal title}"
- Heading: "Building your ladder"
- Subtitle: "Breaking your goal into something so small it barely changes your day."
- Three skeleton rungs; a quiet line "Usually takes a few seconds".
- Minimum display time 1.2s even if the API is faster (a flash reads as broken).
- At 8s, fall back silently and continue.

---

## 3b. Your ladder  (`design/03b-ladder.png`)

**Purpose:** the app proves it understood them. Highest-leverage screen in onboarding.

- Eyebrow: "In your words: {goal title}"
- Heading: "Here's your ladder"
- Subtitle: "Written for you from what you wrote. Tap any line to change the words, or
  try another version."
- Three rungs, top to bottom:
  1. "Where you want to be" / meta "In a year"
  2. "A milestone on the way" / meta "By {date}"
  3. "Your first small step" / meta "Starts tomorrow" — highlighted, indigo border
- Every rung: tap text to edit inline; "Try another" cycles versions with a
  "Version {i} of {n}" counter.
- Step rung also has:
  - green confirmation line: "Under two minutes, no preparation needed"
  - frequency picker (Daily / Weekdays / 3 times), labelled "How often? Your call."
  - plan B block: tag "On a bad day", label "Your plan B, ready in advance", the
    generated plan B text, and its own "Try another"
- Footer note: "Day to day you'll only see the bottom rung. Your check-ins will teach
  the app what really gets in your way, and the plan B gets better from there."
- CTA: "Start tomorrow" → Today.

**Rule:** if the user edits the step and `isStepTooBig` flags it, show a gentle line
offering a smaller version. Never block.

---

## 5. Today  (`design/05-today.png`)

**Purpose:** the daily home. One goal, one decision.

- Header: "{Weekday}, {d Month} · Day {n}" and a greeting.
- Goal card: goal title (small), step (serif, large), "How did today go?" with three
  equal buttons: Done / Partly / Not today. Below a divider: progress bar and
  "{good} good days out of {n} · plan B used {m} times".
- After a check-in, the card shows the logged answer with a "Change" affordance
  instead of the three buttons.
- Review countdown card: "Your first review is in {n} days. You'll see how it went and
  pick a reward."
- Later: collapsible, read-only, with "Once your step is steady, your review will
  offer to swap one in."
- Bottom bar: Today, Review.

---

## 6. Daily nudge  (`design/06-notification.png`)

- Title: the step text. Body: "How did it go today? One tap is enough."
- **Android / desktop:** three action buttons (Done, Partly, Not today) handled in the
  service worker; the check-in is logged without opening the app.
- **iOS:** no action buttons are possible. Clicking opens `/checkin`, where the three
  answers are the first thing on screen and one tap away.
- Fires once at the user's chosen time, and not at all if a check-in already exists.
- The design PNG shows the Android version; treat the iOS version as the same
  notification without the buttons.

### 6b. Add to home screen (iOS)  — no PNG, build to the app's visual language

Shown once after onboarding on iOS Safari, and available later in settings.

- Heading: "Add Kaizen to your home screen"
- Body: "That's how it can nudge you each day, and it opens like an app."
- Three short steps with the Share icon: Share → Add to Home Screen → Add.
- Dismiss link: "Maybe later". The app works fully either way; never block on this.

---

## 7a/b/c. Check-in  (`design/07a-done.png`, `07b-partly.png`, `07c-not-today.png`)

Single screen, three states. Opens with an answer already applied.

- Step in serif at the top, week strip below (solid = done, pale = partly, outline =
  not today, dashed = today).
- Answer switcher: Done / Partly / Not today, current one filled.
- Response:
  - **Done:** "Nice. Step done." + "{n} days out of {m} this week. Small steps are
    adding up." + reward progress bar if a reward is set.
  - **Partly:** "Partly still counts." + "Showing up is the habit. The minutes will
    follow."
  - **Not today:** "That's okay. Tomorrow is fresh." + "One missed day doesn't undo
    the week. Your plan B is ready if it helps:" + the plan B + a
    "Make tomorrow smaller?" toggle.
- Optional one-liner with a mic button. Placeholder changes by answer:
  Done → "A small win from today…", Partly → "What helped, even a little?",
  Not today → "What got in the way?"
- Save → "Saved. See you tomorrow." then Back to today.

**Note:** the "What got in the way?" answers are the blocker data that improves the
plan B. Store them verbatim.

---

## 8. Review tab  (`design/08-review-tab.png`)

- Weekly / Monthly toggle, Weekly by default.
- **Weekly:** week range with arrows, summary ("{good} of {logged} good days logged"),
  seven dots, then a row per day: date, status dot, answer, note snippet. Today's row
  is outlined and reads "Not checked in yet" until logged.
- **Tapping a day:** that day's answer, response card and note, read-only. Yesterday
  is editable until end of today. Tapping today offers the three answers.
- **Monthly:** when a review is due, the start card; otherwise "Next review in {n}
  days" and the list of past reviews.

---

## 9. Day-14 review  (`design/09-review.png`)

One screen, three parts, about two minutes.

- Eyebrow "Day 14 review · about 2 minutes"; heading "Two weeks of small steps".
- **Look back:** two stats ("{good} good days of 14", "{n}× plan B saved the day"), a
  14-dot grid, and one highlighted note with its day.
- **Decide:** "What's next for your step?" with "All three are good answers." and
  three options: Grow it a little / Keep it as it is / Make it smaller, each showing
  the resulting step text. Suggestion by good-day rate: ≥60% grow, 30–60% keep,
  <30% shrink.
- **Reward:** "Pick a reward for the month ahead", four suggestions plus a free field.
  Claimed at the next review.
- Finish → "From tomorrow: {step}. {reward} is waiting at your next review, in a
  month."

After this, reviews are monthly on the same date.

---

## 10. Welcome back  (`design/10-welcome-back.png`)

Shown instead of Today after three missed days, once per lapse.

- Heading: "It's been a few days. That's part of it."
- Subtitle: "Your {n} good days still count. Here are two easy ways back in."
- Two options: "Make it smaller" (suggested, shows the smaller step) and "Pause for a
  week" (shows the return date, "Nothing counts as missed while you're paused").
- Tertiary link: "I'm ready, keep my step as it is".
- "Not now" in the header returns to Today unchanged.

**Never:** red, warning icons, missed-day counts, or any mention of a broken streak.
