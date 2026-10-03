-- Kaizen: initial schema. Every table is protected by row-level security so a
-- user can only read and write their own rows.

create extension if not exists "pgcrypto";

-- profiles ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  timezone text not null default 'UTC',
  review_day int check (review_day between 1 and 28),
  nudge_time time not null default '20:00',
  onboarded_at date
);

-- Create a profile row whenever someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- goals ------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'later' check (status in ('active', 'later', 'dropped', 'done')),
  created_at timestamptz not null default now(),
  started_at date,
  area text,
  paused_until date,                -- "pause for a week" on the welcome back screen
  welcome_back_shown_for date       -- lapse start the welcome back screen was shown for
);
-- Product rule: one active goal per user.
create unique index goals_one_active_per_user on public.goals (user_id) where status = 'active';
create index goals_user_idx on public.goals (user_id);

-- ladders ----------------------------------------------------------------
create table public.ladders (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  long_term text not null,
  milestone text not null,
  milestone_due date,
  plan_b text not null,
  source text not null check (source in ('ai', 'fallback', 'user')),
  created_at timestamptz not null default now()
);
create index ladders_goal_idx on public.ladders (goal_id);

-- steps ------------------------------------------------------------------
create table public.steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  text text not null,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekdays', 'three_times')),
  active_from date not null,
  active_to date,                   -- null = current
  created_at timestamptz not null default now(),
  check (active_to is null or active_to >= active_from)
);
create index steps_goal_idx on public.steps (goal_id);

-- checkins ---------------------------------------------------------------
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  step_id uuid references public.steps (id) on delete set null,
  date date not null,
  answer text not null check (answer in ('done', 'partly', 'not_today')),
  note text,                        -- stored verbatim; "What got in the way?" feeds plan B
  created_at timestamptz not null default now(),
  unique (goal_id, date)            -- one per day; the last answer wins (upsert)
);
create index checkins_goal_date_idx on public.checkins (goal_id, date);

-- reviews ----------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  kind text not null check (kind in ('first_14', 'monthly')),
  period_start date not null,
  period_end date not null,
  good_days int not null,
  decision text not null check (decision in ('grow', 'keep', 'shrink')),
  reward text,
  reward_claimed_at timestamptz,
  completed_at timestamptz,
  unique (goal_id, period_start, period_end)  -- a review cannot be completed twice
);
create index reviews_goal_idx on public.reviews (goal_id);

-- row-level security -----------------------------------------------------
alter table public.profiles enable row level security;
alter table public.goals    enable row level security;
alter table public.ladders  enable row level security;
alter table public.steps    enable row level security;
alter table public.checkins enable row level security;
alter table public.reviews  enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own goals" on public.goals
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Child tables: allowed when the parent goal belongs to the caller.
create policy "own ladders" on public.ladders
  for all to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())))
  with check (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())));

create policy "own steps" on public.steps
  for all to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())))
  with check (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())));

create policy "own checkins" on public.checkins
  for all to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())))
  with check (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())));

create policy "own reviews" on public.reviews
  for all to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())))
  with check (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = (select auth.uid())));
