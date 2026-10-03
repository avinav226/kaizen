-- Swaps the current step for a smaller one from `p_from` onwards, in one transaction.
-- If the current step has not started yet it is edited in place; otherwise it is
-- closed the day before and a new row starts on `p_from`.
create function public.replace_step(p_goal_id uuid, p_text text, p_from date)
returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_current public.steps%rowtype;
  v_new uuid;
begin
  select * into v_current from public.steps
   where goal_id = p_goal_id and active_to is null
   order by active_from desc limit 1;
  if not found then raise exception 'no current step'; end if;

  if v_current.active_from >= p_from then
    update public.steps set text = p_text where id = v_current.id;
    return v_current.id;
  end if;

  update public.steps set active_to = p_from - 1 where id = v_current.id;
  insert into public.steps (goal_id, text, frequency, active_from)
  values (p_goal_id, p_text, v_current.frequency, p_from)
  returning id into v_new;
  return v_new;
end $$;

grant execute on function public.replace_step to authenticated;
