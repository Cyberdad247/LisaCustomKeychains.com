// Nanobot Triage — parallel health checks for every site subsystem.
// Owner-session gated. Returns structured JSON per subsystem.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isOwnerSessionValid, getStorefrontConfig } from "@/lib/storefront-config";
import { getUpcomingPopups } from "@/lib/calendar.server";

export type TriageStatus = "ok" | "warn" | "error" | "unconfigured";

export type TriageCheck = {
  label: string;
  status: TriageStatus;
  detail: string;
  fix?: string; // optional: URL or action hint
};

export type TriageReport = {
  timestamp: string;
  checks: TriageCheck[];
  score: number; // 0–100
};

async function checkShopify(): Promise<TriageCheck> {
  const domain =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!domain) {
    return {
      label: "Shopify API",
      status: "error",
      detail: "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN not set.",
      fix: "Add env var in Vercel project settings.",
    };
  }

  try {
    const res = await fetch(`https://${domain}/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
      },
      body: JSON.stringify({ query: `{ shop { name } }` }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        label: "Shopify API",
        status: "warn",
        detail: `Storefront API returned HTTP ${res.status}. Products may still load from cache.`,
      };
    }

    const data = (await res.json()) as { data?: { shop?: { name?: string } } };
    const name = data?.data?.shop?.name;
    return {
      label: "Shopify API",
      status: "ok",
      detail: `Connected — ${name ?? domain}`,
    };
  } catch (err) {
    return {
      label: "Shopify API",
      status: "error",
      detail: `Connection failed: ${String(err).slice(0, 80)}`,
    };
  }
}

async function checkProductHandles(): Promise<TriageCheck> {
  try {
    const config = await getStorefrontConfig();
    const handles = config.productSlots.map((s) => s.shopifyHandle);

    const domain =
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_DOMAIN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

    if (!domain) {
      return {
        label: "Featured products",
        status: "warn",
        detail: "Cannot validate handles — Shopify domain not configured.",
      };
    }

    const query = `{
      ${handles
        .map(
          (h, i) => `p${i}: product(handle: "${h}") { title }`,
        )
        .join("\n")}
    }`;

    const res = await fetch(`https://${domain}/api/2026-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        label: "Featured products",
        status: "warn",
        detail: "Could not validate handles — Shopify API unavailable.",
      };
    }

    const data = (await res.json()) as { data?: Record<string, { title: string } | null> };
    const missing = handles.filter((_, i) => !data.data?.[`p${i}`]);

    if (missing.length > 0) {
      return {
        label: "Featured products",
        status: "warn",
        detail: `${missing.length} handle(s) not found in Shopify: ${missing.join(", ")}`,
        fix: "/client-editor",
      };
    }

    return {
      label: "Featured products",
      status: "ok",
      detail: `${handles.length} handles verified in Shopify catalog.`,
    };
  } catch (err) {
    return {
      label: "Featured products",
      status: "warn",
      detail: `Validation skipped: ${String(err).slice(0, 60)}`,
    };
  }
}

function checkSocialFeed(): TriageCheck {
  if (process.env.META_ACCESS_TOKEN) {
    return {
      label: "Social feed",
      status: "ok",
      detail: "META_ACCESS_TOKEN configured — live Meta feed enabled.",
    };
  }
  if (process.env.SOCIAL_FEED_JSON) {
    return {
      label: "Social feed",
      status: "warn",
      detail: "Using SOCIAL_FEED_JSON manual feed. Connect META_ACCESS_TOKEN for live posts.",
      fix: "https://developers.facebook.com/apps/",
    };
  }
  return {
    label: "Social feed",
    status: "unconfigured",
    detail: "Showing curated fallback photos. Set META_ACCESS_TOKEN to stream live posts.",
    fix: "https://developers.facebook.com/apps/",
  };
}

function checkCalendarSync(): TriageCheck {
  if (process.env.GOOGLE_CALENDAR_ICS_URL) {
    return {
      label: "Calendar sync",
      status: "ok",
      detail: "GOOGLE_CALENDAR_ICS_URL set — events sync daily at 08:00 UTC.",
    };
  }
  return {
    label: "Calendar sync",
    status: "unconfigured",
    detail: "Set GOOGLE_CALENDAR_ICS_URL to auto-sync events from Google Calendar.",
    fix: "https://calendar.google.com/calendar/r/settings",
  };
}

async function checkEvents(): Promise<TriageCheck> {
  try {
    const events = await getUpcomingPopups();
    if (events.length === 0) {
      return {
        label: "Upcoming events",
        status: "warn",
        detail: "No upcoming events in data/events.json.",
        fix: "/editor",
      };
    }
    const next = events[0];
    return {
      label: "Upcoming events",
      status: "ok",
      detail: `${events.length} event(s) — next: ${next.title} on ${next.date}.`,
    };
  } catch {
    return {
      label: "Upcoming events",
      status: "error",
      detail: "Could not read events file.",
    };
  }
}

function checkAiAssist(): TriageCheck {
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      label: "AI Assist (Hermes)",
      status: "ok",
      detail: "ANTHROPIC_API_KEY set — AI writing assistant enabled.",
    };
  }
  return {
    label: "AI Assist (Hermes)",
    status: "unconfigured",
    detail: "Set ANTHROPIC_API_KEY to enable the AI writing assistant in the editor.",
    fix: "https://console.anthropic.com/settings/keys",
  };
}

async function checkStorefrontConfig(): Promise<TriageCheck> {
  try {
    const config = await getStorefrontConfig();
    const age = Date.now() - new Date(config.updatedAt).getTime();
    const daysSince = Math.floor(age / 86400000);
    if (daysSince > 30) {
      return {
        label: "Storefront config",
        status: "warn",
        detail: `Last published ${daysSince} days ago. Consider reviewing your copy.`,
        fix: "/client-editor",
      };
    }
    return {
      label: "Storefront config",
      status: "ok",
      detail: `Config valid. Last published ${daysSince === 0 ? "today" : `${daysSince}d ago`}.`,
    };
  } catch {
    return {
      label: "Storefront config",
      status: "error",
      detail: "Could not load storefront config.",
    };
  }
}

function scoreChecks(checks: TriageCheck[]): number {
  const weights: Record<TriageStatus, number> = {
    ok: 1,
    warn: 0.6,
    unconfigured: 0.4,
    error: 0,
  };
  const total = checks.reduce((sum, c) => sum + weights[c.status], 0);
  return Math.round((total / checks.length) * 100);
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.allSettled([
    checkShopify(),
    checkProductHandles(),
    Promise.resolve(checkSocialFeed()),
    Promise.resolve(checkCalendarSync()),
    checkEvents(),
    Promise.resolve(checkAiAssist()),
    checkStorefrontConfig(),
  ]);

  const checks: TriageCheck[] = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          label: "Unknown check",
          status: "error" as TriageStatus,
          detail: "Check threw an exception.",
        },
  );

  const report: TriageReport = {
    timestamp: new Date().toISOString(),
    checks,
    score: scoreChecks(checks),
  };

  return NextResponse.json(report);
}
