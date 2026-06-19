import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for persistence that must survive serverless
 * cold starts and redeploys (Vercel's function filesystem is read-only outside
 * /tmp and ephemeral).
 *
 * Prefers the service-role key so server-only writes work without requiring the
 * caller to author RLS policies. Falls back to the anon key (writes then depend
 * on RLS). Returns null when nothing is configured, which lets callers degrade
 * to the local filesystem for development.
 */
let cached: SupabaseClient | null | undefined;

export function getServerSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cached =
    url && key
      ? createClient(url, key, { auth: { persistSession: false } })
      : null;

  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getServerSupabase() !== null;
}
