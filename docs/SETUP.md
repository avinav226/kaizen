# Setup checklist

Accounts and keys needed before and during the build. Do items 1–5 before Step 0 is finished; the rest can wait until the step noted. Never commit secrets: they go in `.env.local` (local) and Vercel environment variables (deployed).

## 1. GitHub (needed for Step 0)
- [ ] Repo `avinav226/kaizen` exists (done).

## 2. Vercel (Step 0)
- [ ] Sign up at vercel.com with GitHub.
- [ ] Import the `kaizen` repo as a new project (framework: Next.js). Production branch: `main`; every other branch gets a preview URL.
- [ ] Note the production URL (e.g. `https://kaizen-xxxx.vercel.app`). You need it for Supabase and Google redirects. A custom domain is optional but best set before Step 4, since push subscriptions are tied to the origin.
- [ ] Later: add the env vars from section 7 under Project → Settings → Environment Variables (Production + Preview).

## 3. Supabase (Step 0)
- [ ] Create a project at supabase.com. Choose the region closest to your users. Save the database password.
- [ ] Project Settings → API: copy
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` public key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `service_role` key → `SUPABASE_SECRET_KEY` (server only, never exposed to the browser)
- [ ] Authentication → URL Configuration:
  - Site URL: the Vercel production URL
  - Redirect URLs: `http://localhost:3000/**`, the production URL `/**`, and `https://*-<your-vercel-team>.vercel.app/**` for previews
- [ ] Authentication → Providers: Email enabled (magic link; confirm email on). Google enabled (see section 4).
- [ ] Authentication → Email templates: edit the magic link email to plain, warm copy matching the app voice.
- [ ] Optional now, recommended before launch: custom SMTP (Resend, Postmark) because the built-in sender is heavily rate limited.
- [ ] Install the Supabase CLI (`npm i -D supabase`), then `npx supabase login` and `npx supabase link --project-ref <ref>` so migrations and Edge Functions can be pushed (Steps 1 and 4).
- [ ] Step 4: enable the `pg_cron` and `pg_net` extensions (Database → Extensions) for the 15-minute nudge schedule.

## 4. Google OAuth (Step 0)
- [ ] console.cloud.google.com → create a project "Kaizen".
- [ ] APIs & Services → OAuth consent screen: External, app name Kaizen, support email, add your email as a test user (publish later to remove the 100-user test limit).
- [ ] Credentials → Create OAuth client ID → Web application.
  - Authorised JavaScript origins: `http://localhost:3000`, the Vercel production URL
  - Authorised redirect URI: `https://<supabase-ref>.supabase.co/auth/v1/callback`
- [ ] Paste the client ID and secret into Supabase → Authentication → Providers → Google.

## 5. Anthropic API (Step 5; get the key early so it is ready)
- [ ] console.anthropic.com → create an API key → `ANTHROPIC_API_KEY` (server only).
- [ ] Set a monthly spend limit in the console. Ladder generation is one short call per goal plus "Try another".
- [ ] Choose the model ID when Step 5 starts (it is a config value, `LADDER_MODEL`).

## 6. Web push keys (Step 4)
- [ ] Generate VAPID keys once: `npx web-push generate-vapid-keys`.
  - Public → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - Private → `VAPID_PRIVATE_KEY` (also set as a Supabase Edge Function secret: `npx supabase secrets set VAPID_PRIVATE_KEY=...`)
  - `VAPID_SUBJECT` = `mailto:you@yourdomain.com`
- [ ] Do not regenerate these later: it invalidates every existing subscription.
- [ ] Devices for testing: an iPhone on iOS 16.4+ (install to home screen first) and an Android phone with Chrome.

## 7. Email nudge fallback (Step 4, optional)
- [ ] Resend (or Postmark) account, verified sending domain, API key → `RESEND_API_KEY`.

## 8. Monitoring and analytics (Step 8)
- [ ] Sentry: create a Next.js project → `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`.
- [ ] Analytics: pick one (PostHog or Plausible) → key in env. Decide before Step 8 so events from the BUILD_PLAN list can be wired in.

## Environment variables summary

| Variable | Where | Needed by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Step 0 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client + server | Step 0 |
| `SUPABASE_SECRET_KEY` | server only | Step 4 (push API), debug seeding |
| `ANTHROPIC_API_KEY` | server only | Step 5 |
| `LADDER_MODEL` | server only | Step 5 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | client | Step 4 |
| `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | server + Edge Function | Step 4 |
| `RESEND_API_KEY` | server | Step 4 (optional) |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | client / build | Step 8 |
| `NEXT_PUBLIC_DEBUG_MENU` | client | `1` while testing (shows the debug menu at `/debug`). Remove it before a public launch. |

## What I need back from you to start Step 0
1. Confirmation that sections 2–4 are done.
2. The three Supabase values (or tell me they are in Vercel and I will use a `.env.example` plus placeholders).
3. Whether you want a custom domain now or later.
