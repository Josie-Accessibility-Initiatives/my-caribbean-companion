-- ── PROFILES: extra fields for the personal dashboard ──
alter table public.profiles
  add column if not exists current_country text,
  add column if not exists date_of_birth date;

-- Copy signup metadata (home_country, date_of_birth) into new profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, home_country, date_of_birth)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'home_country',
    nullif(new.raw_user_meta_data->>'date_of_birth', '')::date
  );
  return new;
end;
$$ language plpgsql security definer;

-- Backfill existing profiles from signup metadata
update public.profiles p
set
  home_country = coalesce(p.home_country, u.raw_user_meta_data->>'home_country'),
  date_of_birth = coalesce(
    p.date_of_birth,
    nullif(u.raw_user_meta_data->>'date_of_birth', '')::date
  )
from auth.users u
where u.id = p.id;

-- ── PLANS: display labels + active plan tracking ──
alter table public.plans
  add column if not exists input jsonb,
  add column if not exists last_opened_at timestamptz default now();

-- Remove duplicate (user_id, plan_id) rows before adding the constraint
delete from public.plans a
using public.plans b
where a.user_id = b.user_id
  and a.plan_id = b.plan_id
  and a.created_at > b.created_at;

alter table public.plans
  add constraint plans_user_plan_unique unique (user_id, plan_id);

-- ── updated_at maintenance ──
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute procedure public.set_updated_at();

-- ── DELETE POLICIES ──
create policy "Users can delete own plans"
  on public.plans for delete
  using (auth.uid() = user_id);

create policy "Users can delete own checklist"
  on public.checklist_items for delete
  using (auth.uid() = user_id);
