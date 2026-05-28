-- ── EXTENSIONS ──────────────────────────────
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────
create table public.profiles (
  id uuid references auth.users(id)
    on delete cascade primary key,
  full_name text,
  home_country text,
  profession text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── PLANS ───────────────────────────────────
create table public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id)
    on delete cascade,
  plan_id text not null,
  from_country text not null,
  to_country text not null,
  category text not null,
  plan_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── CHECKLIST ITEMS ─────────────────────────
create table public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id)
    on delete cascade,
  plan_id text not null,
  step_key text not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, plan_id, step_key)
);

-- ── ROW LEVEL SECURITY ───────────────────────
alter table public.profiles
  enable row level security;
alter table public.plans
  enable row level security;
alter table public.checklist_items
  enable row level security;

-- ── RLS POLICIES ─────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own plans"
  on public.plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on public.plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on public.plans for update
  using (auth.uid() = user_id);

create policy "Users can view own checklist"
  on public.checklist_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own checklist"
  on public.checklist_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own checklist"
  on public.checklist_items for update
  using (auth.uid() = user_id);

-- ── AUTO CREATE PROFILE ON SIGNUP ────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure
  public.handle_new_user();
