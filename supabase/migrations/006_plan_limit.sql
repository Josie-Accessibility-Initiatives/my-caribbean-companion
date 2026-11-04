-- ── Limit signed-in users to 8 saved plans at a time ──
-- Keep in sync with USER_PLAN_LIMIT in lib/plan-limits.ts.
--
-- Enforced in the database because the browser saves plans directly to
-- Supabase, so a check in the UI alone could be bypassed.

create or replace function public.enforce_plan_limit()
returns trigger as $$
declare
  plan_limit constant integer := 8;
begin
  -- Re-saving an existing plan (upsert of the same plan_id) is not a new plan.
  if exists (
    select 1 from public.plans
    where user_id = new.user_id and plan_id = new.plan_id
  ) then
    return new;
  end if;

  if (select count(*) from public.plans where user_id = new.user_id) >= plan_limit then
    -- Custom SQLSTATE so the app can detect this without parsing the message
    -- (PLAN_LIMIT_ERROR_CODE in lib/plan-limits.ts).
    raise exception 'plan_limit_reached'
      using errcode = 'PL001',
            hint = 'Delete a saved plan before creating a new one.';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists plans_enforce_limit on public.plans;
create trigger plans_enforce_limit
  before insert on public.plans
  for each row execute procedure public.enforce_plan_limit();
