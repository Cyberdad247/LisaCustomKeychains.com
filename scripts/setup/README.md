# Setup scripts

One-shot configuration for the conversational editor + durable persistence.

## Steps

```bash
# 0. Link the repo to your Vercel project (once)
npx vercel link

# 1. Create your secrets file (gitignored) and fill it in
cp scripts/setup/.env.setup.example scripts/setup/.env.setup
#   generate a session secret:  openssl rand -hex 32

# 2. Preview what will happen (changes nothing)
DRY_RUN=1 bash scripts/setup/configure.sh

# 3. Apply: push env vars to Vercel + create the Supabase table/bucket
bash scripts/setup/configure.sh

# 4. Redeploy so the new env vars take effect
npx vercel --prod
```

## What it does
- Pushes owner-dashboard, Supabase, and AI-provider env vars to Vercel
  (production + preview), replacing any existing values (idempotent).
- Applies `supabase_storefront.sql` (table + RLS read policy + public
  `storefront-uploads` bucket) when `SUPABASE_DB_URL` is set and `psql` is
  available; otherwise tells you to paste that SQL into the Supabase SQL editor.

## Files
- `configure.sh` — orchestrator (`DRY_RUN=1` to preview).
- `.env.setup.example` — template; copy to `.env.setup` (gitignored) and fill in.
- `supabase_storefront.sql` — idempotent Supabase schema/bucket.

`SUPABASE_DB_URL` is used only locally to run the SQL — it is never pushed to
Vercel. See `docs/STOREFRONT_CONFIG_PERSISTENCE.md` and
`docs/CONVERSATIONAL_EDITOR.md` for the full picture.
