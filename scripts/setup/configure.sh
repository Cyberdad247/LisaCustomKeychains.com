#!/usr/bin/env bash
#
# One-shot setup for the conversational editor + durable persistence:
#   1. Pushes the required env vars to Vercel (production + preview).
#   2. Applies the Supabase table/bucket/RLS (if SUPABASE_DB_URL is provided).
#
# Prereqs:
#   - Vercel CLI installed and the project linked:  npx vercel link
#   - (optional, for step 2) psql installed, or apply the SQL manually.
#
# Usage:
#   cp scripts/setup/.env.setup.example scripts/setup/.env.setup
#   # edit scripts/setup/.env.setup
#   bash scripts/setup/configure.sh                 # apply
#   DRY_RUN=1 bash scripts/setup/configure.sh       # preview, change nothing
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-$HERE/.env.setup}"
DRY_RUN="${DRY_RUN:-0}"

vecho() { printf '\033[36m%s\033[0m\n' "$*"; }
warn()  { printf '\033[33m%s\033[0m\n' "$*" >&2; }
die()   { printf '\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }
run()   { if [ "$DRY_RUN" = "1" ]; then echo "  [dry-run] $*"; else "$@"; fi; }

[ -f "$ENV_FILE" ] || die "Missing $ENV_FILE. Copy .env.setup.example to .env.setup and fill it in."

# Load values without exporting comments/blanks oddly.
set -a; # shellcheck disable=SC1090
source "$ENV_FILE"; set +a

# ── Validate required values ──────────────────────────────────────────────────
required=(OWNER_DASHBOARD_PASSWORD OWNER_DASHBOARD_SECRET \
          NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY)
missing=()
for v in "${required[@]}"; do [ -n "${!v:-}" ] || missing+=("$v"); done
[ ${#missing[@]} -eq 0 ] || die "Fill in these in $ENV_FILE: ${missing[*]}"

if [ -z "${ANTHROPIC_API_KEY:-}${GOOGLE_AI_API_KEY:-}${OLLAMA_BASE_URL:-}" ]; then
  die "Set at least one AI provider (ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, or OLLAMA_BASE_URL) in $ENV_FILE"
fi

if command -v vercel >/dev/null 2>&1; then VERCEL="vercel"; else VERCEL="npx vercel"; fi

# ── 1) Push env vars to Vercel (production + preview) ─────────────────────────
# SUPABASE_DB_URL is intentionally excluded (local-only, for the SQL step).
vercel_vars=(OWNER_DASHBOARD_PASSWORD OWNER_DASHBOARD_SECRET \
  NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY \
  ANTHROPIC_API_KEY ANTHROPIC_MODEL GOOGLE_AI_API_KEY GEMINI_MODEL \
  OLLAMA_BASE_URL OLLAMA_MODEL AI_PROVIDER)

push_env() {
  local name="$1" value="$2" target
  for target in production preview; do
    # Replace any existing value idempotently.
    if [ "$DRY_RUN" = "1" ]; then
      echo "  [dry-run] set $name ($target)"
    else
      $VERCEL env rm "$name" "$target" -y >/dev/null 2>&1 || true
      printf '%s' "$value" | $VERCEL env add "$name" "$target" >/dev/null
      echo "  set $name ($target)"
    fi
  done
}

vecho "==> Pushing env vars to Vercel"
for v in "${vercel_vars[@]}"; do
  val="${!v:-}"
  [ -n "$val" ] || continue
  push_env "$v" "$val"
done

# ── 2) Apply Supabase schema / bucket ─────────────────────────────────────────
vecho "==> Supabase schema + bucket"
if [ -n "${SUPABASE_DB_URL:-}" ]; then
  if command -v psql >/dev/null 2>&1; then
    run psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$HERE/supabase_storefront.sql"
    echo "  applied supabase_storefront.sql"
  else
    warn "  psql not found — paste scripts/setup/supabase_storefront.sql into the Supabase SQL editor."
  fi
else
  warn "  SUPABASE_DB_URL not set — paste scripts/setup/supabase_storefront.sql into the Supabase SQL editor."
fi

vecho "==> Done."
echo "Next: redeploy so the new env vars take effect:  $VERCEL --prod"
