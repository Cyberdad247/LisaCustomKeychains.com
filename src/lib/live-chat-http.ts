import { NextResponse } from "next/server";

/** Origins allowed to use the public live-chat endpoints (the storefront). */
const ALLOWED_ORIGINS = new Set([
  "https://lisascustomkeychains.com",
  "https://www.lisascustomkeychains.com",
  "https://lisa-custom-keychains-editor.vercel.app",
  "http://localhost:3000",
]);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://lisascustomkeychains.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function withCors(res: NextResponse, req: Request): NextResponse {
  const h = corsHeaders(req);
  for (const [k, v] of Object.entries(h)) res.headers.set(k, v);
  return res;
}

export function corsPreflight(req: Request): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

// Simple per-IP rate limiter (per serverless instance — see store note).
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  // Trim the map so it can't grow unbounded.
  if (hits.size > 5000) {
    const oldest = Array.from(hits.entries()).sort((a, b) => a[1][0] - b[1][0])[0];
    if (oldest) hits.delete(oldest[0]);
  }
  return arr.length > max;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
