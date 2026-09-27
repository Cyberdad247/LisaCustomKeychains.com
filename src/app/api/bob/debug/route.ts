import { NextResponse } from "next/server";

// TEMPORARY debug probe — reports only whether BoB env vars are present
// (lengths, never values). Removed after verification.
export async function GET() {
  const gw = process.env.BOB_GATEWAY_URL ?? "";
  const key = process.env.BOB_API_KEY ?? "";
  return NextResponse.json({
    gateway_set: gw.length > 0,
    gateway_len: gw.length,
    key_set: key.length > 0,
    key_len: key.length,
    vercel_env: process.env.VERCEL_ENV ?? null,
  });
}
