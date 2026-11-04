-- ── AI Companion: daily message cap for signed-in users ──
-- The limit itself lives in CHAT_DAILY_LIMIT (lib/chat-limits.ts) and is passed
-- in by /api/chat. Days are counted in UTC.

create table if not exists public.chat_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  message_count integer not null default 0,
  primary key (user_id, day)
);

-- RLS on with no policies: only the service role (server) can read or write.
alter table public.chat_usage enable row level security;

-- Atomically claim one message for today. Returns the count after claiming,
-- or null when the user has already reached p_limit (nothing is changed).
create or replace function public.claim_chat_message(p_user_id uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.chat_usage (user_id, day, message_count)
  values (p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update
    set message_count = chat_usage.message_count + 1
    where chat_usage.message_count < p_limit
  returning message_count into new_count;

  return new_count; -- null when the update's where clause blocked it
end;
$$;

-- Give back a claimed message when the AI request itself failed.
create or replace function public.refund_chat_message(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.chat_usage
  set message_count = greatest(message_count - 1, 0)
  where user_id = p_user_id
    and day = (now() at time zone 'utc')::date;
$$;

-- Server-only: otherwise a signed-in user could call refund from the browser.
revoke all on function public.claim_chat_message(uuid, integer) from public, anon, authenticated;
revoke all on function public.refund_chat_message(uuid) from public, anon, authenticated;
grant execute on function public.claim_chat_message(uuid, integer) to service_role;
grant execute on function public.refund_chat_message(uuid) to service_role;

-- Keep the table small: drop usage rows older than 30 days, daily at 03:15 UTC.
-- (Requires pg_cron, enabled in migration 005.)
select cron.unschedule(jobid) from cron.job where jobname = 'clean-chat-usage';
select cron.schedule(
  'clean-chat-usage',
  '15 3 * * *',
  $$ delete from public.chat_usage where day < (now() at time zone 'utc')::date - 30 $$
);
