// Pure utilities — safe to import in "use client" components (no fs/path)

import { z } from "zod";

export type PopupEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  location: string;
};

export const PopupEventSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  title: z.string().min(1).max(120),
  location: z.string().max(160),
});

/** New manual-event id. Never starts with "ics-", so calendar syncs preserve it. */
export function newEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

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
  const webcal = icsUrl.replace(/^https?:\/\//, "webcal://");
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
}
