-- Idempotent Supabase setup for the storefront config + image uploads.
-- Safe to run multiple times. See docs/STOREFRONT_CONFIG_PERSISTENCE.md.

-- 1) Config table (single 'singleton' row holding the StorefrontConfig JSON).
create table if not exists public.storefront_config (
  id text primary key default 'singleton',
  config jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.storefront_config enable row level security;

-- Public read (the storefront renders from this). Writes use the service-role
-- key, which bypasses RLS, so no write policy is needed.
drop policy if exists "storefront_config_read" on public.storefront_config;
create policy "storefront_config_read"
  on public.storefront_config
  for select
  using (true);

-- 1b) Events table (single 'singleton' row holding the events JSON array).
create table if not exists public.storefront_events (
  id text primary key default 'singleton',
  events jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.storefront_events enable row level security;

drop policy if exists "storefront_events_read" on public.storefront_events;
create policy "storefront_events_read"
  on public.storefront_events
  for select
  using (true);

-- 2) Public Storage bucket for owner-uploaded section images.
insert into storage.buckets (id, name, public)
values ('storefront-uploads', 'storefront-uploads', true)
on conflict (id) do update set public = true;

-- Allow anonymous read of objects in that bucket (so image URLs render).
drop policy if exists "storefront_uploads_public_read" on storage.objects;
create policy "storefront_uploads_public_read"
  on storage.objects
  for select
  using (bucket_id = 'storefront-uploads');
