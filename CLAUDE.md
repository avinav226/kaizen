# CLAUDE.md

Project context for Claude Code. Read this before writing any code.

## What this app is

A habit app based on the Kaizen philosophy of continuous, very small improvement.

The user it serves already knows what they want to do. They are stuck on doing it.
So the app never helps them decide *what* to want. It breaks what they already want
into a step so small they cannot fail at it, plans for the bad days, and keeps them
going through the week where they usually quit (weeks 2 to 4).

One sentence to hold on to: **the app's job is to make the next action feel smaller
than the user's resistance to it.**

## Product rules (these override convenience)

1. **One active goal.** Not two, not "just a few". Everything else lives in Later.
2. **No streaks. Ever.** No streak counters, no "you broke your streak", no flame
   icons, no all-or-nothing calendars. We count good days cumulatively. They never
   reset.
3. **"Not today" is a valid answer, not a failure.** It is logged, acknowledged
   warmly, and never styled as an error (no red, no warning icons, no sad faces).
   A user who logs "Not today" is an engaged user.
4. **Partly counts as a good day.** Showing up imperfectly is the habit.
5. **Steps must be tiny.** Any first step must be doable in under two minutes with
   no preparation and no equipment. If a generated or edited step fails this, the
   app offers a smaller one. It does not scold.
6. **Shrink before quitting.** Whenever the user struggles, the first option offered
   is always a smaller step, then a pause. Deleting the goal is never the first
   suggestion.
7. **The app writes, the user reacts.** Ladders, milestones, steps and plan Bs are
   generated. The user can swap versions or edit, but is never handed a blank field
   during onboarding.
8. **Reviews, not nagging.** The step changes at a review (day 14, then monthly),
   never ad hoc, never automatically.
9. **Nothing is lost.** Items the user did not pick go to Later and stay there until
   they decide otherwise.
10. **One notification a day, maximum.** Never a second nudge on the same day, never
    a "you missed yesterday" push.

## Voice and copy

- Plain, warm, calm. Short sentences. Sentence case.
- Never motivational-poster language ("Crush your goals", "You've got this!").
- Never guilt, pressure, urgency, or FOMO.
- Never gamified language (points, levels, XP, badges).
- Buttons say what happens: "Start tomorrow", "Make it smaller", "Save".
- Setbacks get warmth and a next action, never apology or drama.
  Good: "It's been a few days. That's part of it."
  Bad: "Oops! You've fallen behind. Let's get back on track!!"

## Tech stack

Installable progressive web app. One codebase, no app stores.

- **Next.js (App Router) + TypeScript**, deployed on Vercel.
- **Tailwind CSS** with the tokens from `theme.ts` mapped into `tailwind.config.ts`
  and CSS variables. No hardcoded hex in components.
- **Supabase** for auth (email magic link + Google) and Postgres storage.
- **Serwist** (or `next-pwa`) for the service worker, offline shell and install
  prompt. The app must work when opened offline and sync check-ins when back online.
- **Web Push** (VAPID, the `web-push` library) from a Supabase Edge Function on a
  cron schedule, one push per user per day at their chosen time.
- **Anthropic API** for ladder generation, called from a Next.js route handler so the
  key stays server-side.
- **Zustand** for client state, **date-fns** for dates.

### The notification constraint (read this before step 4)

This is the one real cost of choosing a PWA, and the product has to absorb it:

- **Android / desktop Chrome:** full web push, including action buttons. Done /
  Partly / Not today work from the notification exactly as designed.
- **iOS (16.4+):** web push works **only after the user adds the app to their home
  screen**, and **notification action buttons are not supported**. Tapping the
  notification opens the app instead.

So the app must:
1. Treat the home-screen install as part of onboarding on iOS, with a short,
   friendly explainer screen ("Add Kaizen to your home screen so it can nudge you").
   Never a nag banner on every visit.
2. Make the notification body itself the call to action, and deep-link to the
   check-in screen: `/checkin?answer=done` etc. On Android these are action buttons;
   on iOS tapping the body opens `/checkin` with the three answers one tap away.
3. Work fully without notifications at all. A user who denies permission still gets
   the whole loop; Today just shows a quiet line about turning nudges on.
4. Offer an email nudge as a fallback option, since email is reliable everywhere.

Design everything so that **the app opening is enough**: Today should always make the
day's check-in a single tap, because for some users that will be the only route in.

## Code conventions

- TypeScript strict mode. No `any`.
- All colour, spacing and type values come from `theme.ts`. No hardcoded hex in
  components.
- One component per file. Routes in `app/`, shared UI in `components/`,
  domain logic in `lib/`. Server-only code (Anthropic calls, push sending) never
  imported into a client component.
- Domain logic (step sizing, review timing, good-day counting, stumbling-block
  detection) lives in pure functions in `lib/` with unit tests. Never inline it in
  a component.
- Dates are stored as ISO date strings in the user's local timezone. A "day" runs
  to local midnight.
- All touch targets at least 44x44. All interactive elements have accessible labels.
- Mobile-first: design at 390px wide and let it centre on larger screens with a
  max-width of about 430px. This is a phone app that happens to run in a browser.
- Respect `env(safe-area-inset-*)` so the bottom bar clears the iOS home indicator
  when installed.

## Design

Screen designs are in `design/` as PNGs, numbered in flow order. Match them closely:
spacing, type sizes, and copy are deliberate. Where a screen has several states
(e.g. check-in: done / partly / not today), each state has its own PNG.

Visual direction, summarised (full tokens in `theme.ts`):
- Warm paper background, near-black ink, deep indigo as the one accent colour.
- Shippori Mincho (serif) for the step, goal and headlines; IBM Plex Sans for
  everything else. The serif carries the calm; do not replace it with a system font.
- Status colours: indigo = done, muted blue = partly, outline only = not today.
  Green appears only for earned rewards and positive confirmations. Warm clay
  appears only for "on a bad day" context, never as an error colour.
- Generous spacing, 12 to 18px corner radii, no drop shadows.

## Debug menu (build this early)

Testing this app in real time takes weeks. Build a dev-only debug menu that can:
- jump the clock forward n days
- seed a month of check-in history with a given pattern
- force the day-14 review state
- simulate three missed days to trigger the welcome back screen
- clear all local data

## What is NOT in the MVP

Do not build these, and do not leave stubs for them in the UI: a second active goal,
the life inventory, the Progress tab, buddies and cheers, the shared buddy web page,
community tips, small wins mode, voice notes, widgets, social login beyond
Google, native app wrappers, or any paid tier.
