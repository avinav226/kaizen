# Build plan

Work one step at a time. Each step ends with a working app and a commit. Do not start
the next step until the acceptance criteria of the current one pass on a device or
simulator.

Read `CLAUDE.md` first, and the matching section of `SCREENS.md` before building any
screen.

---

## Step 0 — Project setup

- Next.js (App Router) + TypeScript + Tailwind, deployed to Vercel from day one so
  you can test on a real phone throughout.
- `theme.ts` tokens mapped into `tailwind.config.ts` and CSS variables.
  Shippori Mincho and IBM Plex Sans via `next/font/google`.
- Mobile-first shell: 390px design width, centred, max-width ~430px, safe-area
  padding.
- Supabase project, client + server helpers, email magic link and Google sign-in.
- Empty routes so the whole flow can be walked end to end.

**Done when:** the deployed URL loads on your phone, sign-in works, and both fonts
render.

---

## Step 1 — Data model and domain logic

Tables (Supabase, with row-level security so a user only reads their own rows):

```
profiles      id, created_at, timezone, review_day (int 1-28), onboarded_at
goals         id, user_id, title (user's words), status (active|later|dropped|done),
              created_at, started_at, area (nullable)
ladders       id, goal_id, long_term, milestone, milestone_due, plan_b,
              source (ai|fallback|user), created_at
steps         id, goal_id, text, frequency (daily|weekdays|three_times),
              active_from, active_to (null = current), created_at
checkins      id, goal_id, step_id, date (ISO), answer (done|partly|not_today),
              note (nullable), created_at
reviews       id, goal_id, kind (first_14|monthly), period_start, period_end,
              good_days, decision (grow|keep|shrink), reward (nullable),
              reward_claimed_at, completed_at
```

Pure functions in `lib/` with unit tests:

- `isGoodDay(answer)` — done and partly are good days, not_today is not.
- `countGoodDays(checkins)` — cumulative, never resets.
- `isStepTooBig(text)` — flags durations over 2 minutes, equipment or preparation
  words. Returns a reason, used for a gentle nudge, never a block.
- `nextReviewDate(onboardedAt, reviews)` — first review 14 days after onboarding,
  then monthly on the same date.
- `needsWelcomeBack(checkins, today)` — true when the last 3 consecutive days have
  no check-in or are all not_today, and the welcome back screen has not been shown
  in this lapse.
- `weekSummary(checkins, weekStart)` and `periodSummary(checkins, from, to)`.

**Done when:** tests pass for the above, including edge cases (timezone rollover,
a paused goal, a goal created mid-week).

---

## Step 2 — Onboarding (3 screens)

Screens 1, 2, 3a/3b in `SCREENS.md`. Use a **hardcoded ladder** at this stage; the
API comes in step 5. Keep the loading screen in the flow with an artificial delay so
the transition is built and tested now.

**Done when:** a new user can go from sign-up to an active goal with a step and a
plan B stored in Supabase, and the unpicked items exist as `later` goals.

---

## Step 3 — Today and check-in

Screens 5, 7a, 7b, 7c.

- Today shows the active goal, its current step, the three answers, cumulative good
  days, and a countdown to the first review.
- Tapping an answer opens the check-in screen with that answer applied and saved
  immediately. The user can switch answers there; the last answer of the day wins.
- The optional one-line note saves with the check-in.
- "Not today" shows the plan B and offers a smaller step for tomorrow. Accepting it
  creates a new `steps` row (active_from = tomorrow) and closes the previous one.
- Later list is visible and read-only.

**Done when:** a full day loop works offline-tolerant: answer, note, reopen, change
answer, and the state is still correct after killing the app.

---

## Step 3.5 — Make it installable

Do this before notifications; on iOS, push depends on it.

- Web app manifest (name, icons from 192 to 512, `display: standalone`, theme and
  background colours from `theme.ts`), service worker via Serwist.
- Offline shell: the app opens and shows Today from cached data with no network.
  Check-ins made offline queue and sync on reconnect.
- Install prompt: on Android use `beforeinstallprompt`; on iOS show a short
  "Add to home screen" explainer with the Share → Add to Home Screen steps. Show it
  once, after onboarding, plus a permanent entry in settings. Never a repeating nag.

**Done when:** the app installs to the home screen on both an iPhone and an Android
phone, opens standalone without browser chrome, and works in airplane mode.

---

## Step 4 — Web push (riskiest step, leave buffer)

Read the notification constraint section in `CLAUDE.md` first.

- Ask for permission after onboarding, never on first load, with a one-line reason.
- VAPID keys; store subscriptions per user and device in Supabase.
- A scheduled Edge Function runs every 15 minutes, finds users whose local nudge time
  has arrived and who have no check-in today, and sends one push.
- Notification: title = the step text, body = "How did it go today? One tap is
  enough."
  - **Android/desktop:** three action buttons (Done / Partly / Not today). The
    service worker handles the click, posts the check-in, and shows a brief
    confirmation notification. No app window needed.
  - **iOS:** no action buttons. Clicking opens `/checkin`, where the three answers
    are the first thing on screen.
- Deep links: `/checkin?answer=done|partly|not_today` apply the answer immediately.
- Never more than one push a day. Cancel/skip once a check-in exists.
- Handle: permission denied, subscription expired (clean up on 410), timezone change,
  and a user who never installs on iOS (fall back to the optional email nudge).

**Done when:** an Android install can answer from the notification without opening
the app, an iOS install receives the push and lands on the check-in screen with the
answer applied, and a user with notifications denied can still complete the loop.

---

## Step 5 — AI ladder generation

- Next.js route handler `POST /api/ladder` (server-only) calls the Anthropic API with the prompt in
  `prompts/ladder.md` and returns validated JSON (schema in the same file).
- The client calls the function once when a goal is picked, and again for
  "Try another" (passing the versions already shown so alternatives differ).
- Validate server-side: if the JSON is malformed, a step fails `isStepTooBig`, or the
  call times out (8s), fall back to `lib/fallbackLadders.ts` and mark
  `ladders.source = 'fallback'`. The user must never see an error state here.
- Log prompt, response and chosen version (not personal content beyond the goal text)
  so suggestion quality can be reviewed.

**Done when:** ten different goals typed by hand all produce a usable ladder, and a
forced API failure still completes onboarding.

---

## Step 6 — Review tab and the day-14 review

Screens 8 and 9.

- Review tab defaults to Weekly: the week's days with status, note snippets, and
  arrows to previous weeks. Tapping a day shows that day's result.
- Past days are read-only, except yesterday, which stays editable until end of today.
- Monthly toggle shows the countdown, or the start card when a review is due.
- The review screen: period summary, one highlighted note, grow/keep/shrink (with
  grow suggested when good days are 60% or more, keep when 30 to 60%, shrink when
  below 30%), and reward selection.
- Completing a review writes a `reviews` row and the new `steps` row.

**Done when:** with the debug menu, a seeded 14 days produces a correct review, each
decision produces the right next step, and the review cannot be completed twice.

---

## Step 7 — Welcome back

Screen 10.

- On app open, if `needsWelcomeBack` is true, show this instead of Today, once per
  lapse.
- Options: make it smaller (suggested) or pause for a week. Plus "keep my step as it
  is". Pausing suppresses notifications and excludes those days from any counts.
- Nothing about this screen is styled as an error.

**Done when:** three simulated missed days trigger it, each option behaves correctly,
and it does not reappear the next day after being dismissed.

---

## Step 8 — Polish and ship

- Empty, loading and offline states for every screen.
- Lighthouse PWA audit passing; installability verified on iOS and Android.
- Accessibility pass: labels, contrast, text scaling, reduced motion, keyboard focus.
- Analytics events: `onboarding_completed`, `checkin_logged` (with answer and
  source: app or notification), `ladder_generated` (source, try_another_count),
  `review_completed` (decision), `welcome_back_shown`, `welcome_back_choice`.
- Error tracking (Sentry), app icons and splash screens, an og-image, and a short
  landing page explaining the method, with "Add to home screen" instructions.

**Metrics that matter after launch:** day-30 check-in rate (any answer), activation
(first check-in within 24h), comeback rate after a 3-day lapse, review completion,
and the grow/keep/shrink split. For a PWA, also track install rate and
notification-permission rate by platform, and compare day-30 retention for installed
versus browser-only users — if the gap is large, the install explainer is where to
spend effort.
