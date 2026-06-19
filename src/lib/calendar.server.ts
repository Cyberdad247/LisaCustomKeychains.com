// Server-only — uses fs/promises. Never import this in "use client" files.
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { type PopupEvent } from "./calendar";
import { getServerSupabase } from "./supabase-server";

// Supabase persistence (durable on Vercel, where the FS is read-only/ephemeral).
const EVENTS_TABLE = process.env.STOREFRONT_EVENTS_TABLE || "storefront_events";
const EVENTS_ROW_ID = "singleton";

// ── ICS parsing ──────────────────────────────────────────────────────────────

function unfoldICS(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function extractField(block: string, name: string): string {
  const match = block.match(new RegExp(`(?:^|\\n)${name}(?:;[^:]*)?:([^\\n\\r]+)`, "m"));
  return match?.[1]?.trim() ?? "";
}

function parseICSDate(dtstart: string): string | null {
  const raw = dtstart.includes(":") ? dtstart.split(":").pop()! : dtstart;
  const dateOnly = raw.replace(/T.*/, "").replace(/-/g, "");
  if (dateOnly.length < 8) return null;
  return `${dateOnly.slice(0, 4)}-${dateOnly.slice(4, 6)}-${dateOnly.slice(6, 8)}`;
}

export function parseICSEvents(icsText: string): PopupEvent[] {
  const unfolded = unfoldICS(icsText);
  const blocks = unfolded.split("BEGIN:VEVENT").slice(1);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return blocks
    .map((block): PopupEvent | null => {
      const summary = extractField(block, "SUMMARY");
      const dtstart = extractField(block, "DTSTART");
      const location = extractField(block, "LOCATION");
      const uid = extractField(block, "UID");
      if (!summary || !dtstart) return null;
      const date = parseICSDate(dtstart);
      if (!date) return null;
      return {
        id: uid || `ics-${date}-${summary.slice(0, 12).replace(/\s+/g, "-").toLowerCase()}`,
        date,
        title: summary,
        location,
      };
    })
    .filter((e): e is PopupEvent => e !== null && new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ── Persistence (Supabase when configured, filesystem fallback for dev) ───────

const EVENTS_PATH = path.join(process.cwd(), "data", "events.json");

/** All events (unfiltered). Used by the owner editor. */
export async function getAllEvents(): Promise<PopupEvent[]> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(EVENTS_TABLE)
        .select("events")
        .eq("id", EVENTS_ROW_ID)
        .maybeSingle();
      if (error) throw error;
      return Array.isArray(data?.events) ? (data.events as PopupEvent[]) : [];
    } catch (err) {
      console.error("[events] Supabase read failed:", err);
      return [];
    }
  }
  try {
    return JSON.parse(await readFile(EVENTS_PATH, "utf-8")) as PopupEvent[];
  } catch {
    return [];
  }
}

export async function saveAllEvents(events: PopupEvent[]): Promise<void> {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const supabase = getServerSupabase();
  if (supabase) {
    const { error } = await supabase.from(EVENTS_TABLE).upsert(
      { id: EVENTS_ROW_ID, events: sorted, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
    if (error) {
      console.error("[events] Supabase write failed:", error);
      throw new Error(`Failed to save events: ${error.message}`);
    }
    return;
  }
  await mkdir(path.dirname(EVENTS_PATH), { recursive: true });
  await writeFile(EVENTS_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf-8");
}

/** Upcoming events only (today onward), for the public storefront. */
export async function getUpcomingPopups(): Promise<PopupEvent[]> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return (await getAllEvents())
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function syncEventsFromICS(): Promise<{ synced: number; error?: string }> {
  const icsUrl = process.env.GOOGLE_CALENDAR_ICS_URL?.trim();
  if (!icsUrl) return { synced: 0, error: "GOOGLE_CALENDAR_ICS_URL not set" };

  let icsText: string;
  try {
    const res = await fetch(icsUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    icsText = await res.text();
  } catch (err) {
    return { synced: 0, error: `Fetch failed: ${String(err)}` };
  }

  const icsEvents = parseICSEvents(icsText);

  // Preserve manually-added events (ids that don't start with "ics-").
  const manual = (await getAllEvents()).filter((e) => !e.id.startsWith("ics-"));
  const merged = [...manual, ...icsEvents];
  await saveAllEvents(merged);
  return { synced: icsEvents.length };
}
