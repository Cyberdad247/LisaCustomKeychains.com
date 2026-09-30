import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Business health snapshot for the Command Center TriagePanel.
// Aggregates: open quotes (VPS), content queue depth, social posting streak.
// Owner-gated. Never blocks on a failing source — reports "unknown" instead.

const GATEWAY = "https://bob.lisascustomkeychains.com";

export type BusinessMetric = {
  label: string;
  value: string;
  status: "ok" | "warn" | "error" | "unknown";
  detail: string;
};

async function quoteCount(): Promise<BusinessMetric> {
  try {
    const apiKey = process.env.BOB_API_KEY;
    if (!apiKey) {
      return { label: "Quote pipeline", value: "—", status: "unknown", detail: "BOB_API_KEY not reaching runtime" };
    }
    const res = await fetch(`${GATEWAY}/quotes`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    const quotes = data.quotes ?? [];
    const open = quotes.filter((q: { status?: string }) => q.status !== "closed" && q.status !== "lost").length;
    return {
      label: "Open quotes",
      value: String(open),
      status: open > 0 ? "ok" : "warn",
      detail: open > 0 ? `${open} awaiting follow-up` : "No open quotes — quiet pipeline",
    };
  } catch {
    return { label: "Open quotes", value: "—", status: "unknown", detail: "Could not reach quote inbox" };
  }
}

async function contentDepth(): Promise<BusinessMetric> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "content-queue.json"), "utf-8");
    const items = JSON.parse(raw) as { status?: string }[];
    const pending = items.filter((i) => i.status === "pending").length;
    return {
      label: "Content awaiting approval",
      value: String(pending),
      status: pending > 0 ? "warn" : "ok",
      detail: pending > 0 ? `${pending} items need Lisa's eye` : "Queue is clear",
    };
  } catch {
    return { label: "Content awaiting approval", value: "0", status: "ok", detail: "Queue is empty" };
  }
}

async function postingStreak(): Promise<BusinessMetric> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "social-calendar.json"), "utf-8");
    const posts = JSON.parse(raw) as { status?: string; scheduledDate?: string; createdAt?: string }[];
    const published = posts
      .filter((p) => p.status === "published")
      .map((p) => new Date(p.scheduledDate ?? p.createdAt ?? 0).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => b - a);
    if (published.length === 0) {
      return { label: "Last published post", value: "never", status: "warn", detail: "No published posts yet — start the M/W/F cadence" };
    }
    const days = Math.floor((Date.now() - published[0]) / 86_400_000);
    return {
      label: "Last published post",
      value: days === 0 ? "today" : `${days}d ago`,
      status: days <= 3 ? "ok" : days <= 7 ? "warn" : "error",
      detail: days <= 3 ? "Cadence on track" : "Posting cadence slipping",
    };
  } catch {
    return { label: "Last published post", value: "—", status: "unknown", detail: "No social data yet" };
  }
}

export async function GET() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const metrics = await Promise.all([quoteCount(), contentDepth(), postingStreak()]);
  return NextResponse.json({ timestamp: new Date().toISOString(), metrics });
}
