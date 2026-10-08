-- complete_onboarding used to refuse when the profile said "already onboarded". That flag can be
-- out of step with the real data (for example after a partly finished reset), which would leave
-- someone unable to save a goal. Decide from the goals themselves instead: onboarding is refused
-- only when an active goal already exists. (The one-active-goal index enforces the same rule.)
create or replace function public.complete_onboarding(
  p_timezone text,
  p_today date,
  p_goals text[],
  p_active_index int,
  p_long_term text,
  p_milestone text,
  p_milestone_due date,
  p_plan_b text,
  p_source text,
  p_step_text text,
  p_frequency text
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_goal uuid;
  v_count int := coalesce(array_length(p_goals, 1), 0);
  i int;
begin
  if v_uid is null then raise exception 'not signed in'; end if;
  if p_active_index < 1 or p_active_index > v_count then raise exception 'invalid goal selection'; end if;
  if exists (select 1 from public.goals where user_id = v_uid and status = 'active') then
    raise exception 'you already have an active goal';
  end if;

  insert into public.profiles (id) values (v_uid) on conflict do nothing;

  for i in 1..v_count loop
    if i = p_active_index then
      insert into public.goals (user_id, title, status, started_at)
      values (v_uid, p_goals[i], 'active', p_today + 1)
      returning id into v_goal;
    else
      insert into public.goals (user_id, title, status) values (v_uid, p_goals[i], 'later');
    end if;
  end loop;

  insert into public.ladders (goal_id, long_term, milestone, milestone_due, plan_b, source)
  values (v_goal, p_long_term, p_milestone, p_milestone_due, p_plan_b, p_source);

  insert into public.steps (goal_id, text, frequency, active_from)
  values (v_goal, p_step_text, p_frequency, p_today + 1);

  update public.profiles set timezone = p_timezone, onboarded_at = p_today where id = v_uid;
  return v_goal;
end $$;
