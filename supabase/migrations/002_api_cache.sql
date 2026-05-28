-- ── API CACHE ────────────────────────────────
-- Server-side only — no RLS needed
-- API routes use service role key to read/write

create table public.api_cache (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  cached_at timestamptz default now(),
  expires_at timestamptz not null
);

-- Index for fast key lookups
create index api_cache_key_idx
  on public.api_cache(key);

-- Index for cache cleanup queries
create index api_cache_expires_idx
  on public.api_cache(expires_at);
