-- ── Scheduled database cleanup (pg_cron) ──
-- Requires the pg_cron extension. If this line fails, enable it in the
-- Supabase dashboard under Database → Extensions → pg_cron, then re-run.
create extension if not exists pg_cron;

-- Re-running this migration replaces the jobs instead of duplicating them.
select cron.unschedule(jobid)
from cron.job
where jobname in ('clean-api-cache', 'clean-unconfirmed-users');

-- 1. Expired API cache rows — daily at 03:00 UTC.
--    getCached() already ignores expired rows; this stops the table growing.
select cron.schedule(
  'clean-api-cache',
  '0 3 * * *',
  $$ delete from public.api_cache where expires_at < now() $$
);

-- 2. Signups that never confirmed their email — Sundays at 04:00 UTC.
--    Their profiles/plans/checklist rows are removed by ON DELETE CASCADE.
select cron.schedule(
  'clean-unconfirmed-users',
  '0 4 * * 0',
  $$ delete from auth.users
     where email_confirmed_at is null
       and created_at < now() - interval '7 days' $$
);

-- Check the jobs:   select jobname, schedule, active from cron.job;
-- Check run history: select * from cron.job_run_details order by start_time desc limit 20;
