"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Trash2, Pencil, Plus, RefreshCw } from "lucide-react";

import type { PopupEvent } from "@/lib/calendar";
import { saveEventAction, deleteEventAction, syncCalendarAction } from "./actions";

type Props = {
  events: PopupEvent[];
  calendarConfigured: boolean;
};

const EMPTY = { id: "", date: "", title: "", location: "" };

export default function EventManager({ events, calendarConfigured }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const editing = form.id !== "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("id", form.id);
    fd.set("date", form.date);
    fd.set("title", form.title);
    fd.set("location", form.location);
    const res = await saveEventAction(fd);
    setBusy(false);
    if (res.ok) {
      setForm(EMPTY);
      router.refresh();
    } else {
      setMsg(res.error);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setMsg(null);
    const res = await deleteEventAction(id);
    setBusy(false);
    if (res.ok) router.refresh();
    else setMsg(res.error);
  }

  async function sync() {
    setBusy(true);
    setMsg(null);
    const res = await syncCalendarAction();
    setBusy(false);
    if (res.ok) {
      setMsg(`Synced ${res.synced} event${res.synced === 1 ? "" : "s"} from Google Calendar.`);
      router.refresh();
    } else {
      setMsg(res.error);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-700">
            Events
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Pop-up events</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add the markets and pop-ups where customers can find you. Past events hide
            automatically.
          </p>
        </div>
        <button
          onClick={sync}
          disabled={busy || !calendarConfigured}
          title={
            calendarConfigured
              ? "Pull events from your Google Calendar"
              : "Set GOOGLE_CALENDAR_ICS_URL to enable Google Calendar sync"
          }
          className="inline-flex items-center gap-2 self-start rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          Sync Google Calendar
        </button>
      </div>

      {!calendarConfigured && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          To link Google Calendar, set <code>GOOGLE_CALENDAR_ICS_URL</code> (your calendar&apos;s
          secret iCal address) in the environment. You can still add events by hand below.
        </p>
      )}

      {msg && (
        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          {msg}
        </p>
      )}

      {/* Event list */}
      <ul className="mt-5 grid gap-2">
        {events.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
            No events yet. Add one below.
          </li>
        )}
        {events.map((ev) => (
          <li
            key={ev.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-purple-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {ev.date} — {ev.title}
                {ev.id.startsWith("ics-") && (
                  <span className="ml-2 rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-purple-600">
                    Google
                  </span>
                )}
              </p>
              {ev.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" /> {ev.location}
                </p>
              )}
            </div>
            <button
              onClick={() => setForm({ ...ev })}
              disabled={busy}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-purple-700 disabled:opacity-40"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(ev.id)}
              disabled={busy}
              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add / edit form */}
      <form onSubmit={submit} className="mt-5 grid gap-3 rounded-lg bg-stone-50 p-4 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Date
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-950"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Event title
          <input
            type="text"
            required
            maxLength={120}
            placeholder="Summer Craft Market"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-950"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">
          Location
          <input
            type="text"
            maxLength={160}
            placeholder="Riverside Park Pavilion"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-950"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {editing ? "Save" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              disabled={busy}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-stone-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
