# Storefront Config Persistence

The `/client-editor` owner panel lets Lisa edit homepage copy, social links,
featured Shopify handles, and upload images. Those edits used to be written to
the local filesystem (`data/storefront-config.json` and `public/uploads/`).

**That does not work on Vercel.** Serverless functions run on a read-only,
ephemeral filesystem (only `/tmp` is writable, and it disappears between
invocations). In production, filesystem writes either throw or silently vanish
on the next cold start or redeploy — so owner edits never persisted.

## How it works now

`src/lib/storefront-config.ts` chooses a backend at runtime:

| Backend | When | Config | Images |
|---|---|---|---|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` + a key are set | `storefront_config` table | `storefront-uploads` Storage bucket |
| **Filesystem** | Supabase not configured (local dev) | `data/storefront-config.json` | `public/uploads/` |

The Supabase client (`src/lib/supabase-server.ts`) prefers
`SUPABASE_SERVICE_ROLE_KEY` (server-only) so owner writes bypass RLS, and falls
back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` (writes then depend on RLS policies).

## One-time Supabase setup

### 1. Create the config table

Run in the Supabase SQL editor:

```sql
create table if not exists public.storefront_config (
  id text primary key default 'singleton',
  config jsonb not null,
  updated_at timestamptz not null default now()
);

-- Enable RLS; the service-role key bypasses these policies.
alter table public.storefront_config enable row level security;

-- Allow anonymous reads (the public storefront reads the config).
create policy "storefront_config_read"
  on public.storefront_config for select
  using (true);
```

> Writes are performed with the service-role key, which bypasses RLS, so no
> write policy is required. If you instead rely on the anon key for writes, add
> an appropriate `insert`/`update` policy.

### 2. Create the Storage bucket

In Supabase → Storage, create a **public** bucket named `storefront-uploads`
(or set `STOREFRONT_UPLOAD_BUCKET` to your bucket name). Public access is needed
so uploaded image URLs render on the storefront.

### 3. Set environment variables

In Vercel (Production + Preview) and your local `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only — never expose to the client
```

Optional name overrides: `STOREFRONT_CONFIG_TABLE`, `STOREFRONT_UPLOAD_BUCKET`.

## Migrating an existing `data/storefront-config.json`

If you have local edits to carry over, seed the row once:

```sql
insert into public.storefront_config (id, config)
values ('singleton', '<paste the JSON contents here>'::jsonb)
on conflict (id) do update set config = excluded.config, updated_at = now();
```

Otherwise the app starts from `defaultStorefrontConfig` and the first owner save
creates the row automatically.
