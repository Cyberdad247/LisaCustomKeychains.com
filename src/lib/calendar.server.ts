// Server-only — uses fs/promises. Never import this in "use client" files.
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { type PopupEvent } from "./calendar";

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

// ── File I/O ─────────────────────────────────────────────────────────────────

const EVENTS_PATH = path.join(process.cwd(), "data", "events.json");

export async function getUpcomingPopups(): Promise<PopupEvent[]> {
  try {
    const raw = await readFile(EVENTS_PATH, "utf-8");
    const events: PopupEvent[] = JSON.parse(raw);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return [];
  }
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

  let existing: PopupEvent[] = [];
  try {
    existing = JSON.parse(await readFile(EVENTS_PATH, "utf-8"));
  } catch {
    // first sync — no existing file yet
  }
  const manual = existing.filter((e) => !e.id.startsWith("ics-"));

  const merged = [...manual, ...icsEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  await mkdir(path.dirname(EVENTS_PATH), { recursive: true });
  await writeFile(EVENTS_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");
  return { synced: icsEvents.length };
}
