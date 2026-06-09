import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export type PopupEvent = {
  id: string;
  date: string;   // YYYY-MM-DD
  title: string;
  location: string;
};

// ── ICS parsing ──────────────────────────────────────────────────────────────

function unfoldICS(raw: string): string {
  // RFC 5545 line folding: CRLF or LF followed by a single space/tab
  return raw.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function extractField(block: string, name: string): string {
  // Matches FIELDNAME or FIELDNAME;PARAM=VALUE
  const match = block.match(new RegExp(`(?:^|\\n)${name}(?:;[^:]*)?:([^\\n\\r]+)`, "m"));
  return match?.[1]?.trim() ?? "";
}

function parseICSDate(dtstart: string): string | null {
  // Strip everything before the colon (handles DTSTART;TZID=...:YYYYMMDD form)
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

// ── Google Calendar helpers ──────────────────────────────────────────────────

export function buildAddToCalendarUrl(event: PopupEvent): string {
  const start = event.date.replace(/-/g, "");
  const next = new Date(event.date + "T12:00:00");
  next.setDate(next.getDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const params = new URLSearchParams({
    text: event.title,
    dates: `${start}/${end}`,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

export function buildSubscribeUrl(icsUrl: string): string {
  // webcal:// URL triggers "Subscribe in Google Calendar" dialog
  const webcal = icsUrl.replace(/^https?:\/\//, "webcal://");
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
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

export async function syncEventsFromICS(): Promise<{
  synced: number;
  error?: string;
}> {
  const icsUrl = process.env.GOOGLE_CALENDAR_ICS_URL?.trim();
  if (!icsUrl) {
    return { synced: 0, error: "GOOGLE_CALENDAR_ICS_URL not set" };
  }

  let icsText: string;
  try {
    const res = await fetch(icsUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    icsText = await res.text();
  } catch (err) {
    return { synced: 0, error: `Fetch failed: ${String(err)}` };
  }

  const icsEvents = parseICSEvents(icsText);

  // Preserve manually-entered events (those without an ics- prefix)
  let existing: PopupEvent[] = [];
  try {
    existing = JSON.parse(await readFile(EVENTS_PATH, "utf-8"));
  } catch {
    // first sync — no existing file
  }
  const manual = existing.filter((e) => !e.id.startsWith("ics-"));

  const merged = [...manual, ...icsEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  await mkdir(path.dirname(EVENTS_PATH), { recursive: true });
  await writeFile(EVENTS_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");

  return { synced: icsEvents.length };
}
