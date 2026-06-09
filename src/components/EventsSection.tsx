"use client";

import { CalendarDays, CalendarPlus, MapPin, CalendarCheck, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { type StorefrontConfig } from "@/lib/storefront-config";
import { type PopupEvent, buildAddToCalendarUrl, buildSubscribeUrl } from "@/lib/calendar";

interface EventsSectionProps {
  section?: StorefrontConfig["homepageSections"][number];
  events?: PopupEvent[];
}

const MONTH_SHORT = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
];

function DateBadge({ date }: { date: string }) {
  const d = new Date(date + "T12:00:00");
  return (
    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-purple-600 text-white shrink-0 shadow-md shadow-purple-200">
      <span className="text-[9px] font-black uppercase tracking-widest leading-none">
        {MONTH_SHORT[d.getMonth()]}
      </span>
      <span className="text-2xl font-black leading-none mt-0.5">
        {d.getDate()}
      </span>
    </div>
  );
}

export default function EventsSection({ section, events = [] }: EventsSectionProps) {
  const icsUrl = typeof window !== "undefined"
    ? undefined
    : process.env.GOOGLE_CALENDAR_ICS_URL;

  return (
    <section id="events" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* ── Header ── */}
        <div className="mb-14 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-purple-100 bg-purple-50">
              <CalendarDays className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="font-serif text-4xl text-slate-950 md:text-5xl">
              {section?.headline || "Find Lisa at Pop-Up Events"}
            </h2>
            <p className="mt-4 max-w-2xl text-slate-500">
              {section?.body ||
                "Lisa vends at local craft markets, school events, and community pop-ups. Add events to your calendar so you never miss a table."}
            </p>
          </div>

          {/* Calendar sync status card */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <CalendarCheck className="h-4 w-4 text-purple-600" />
              Always up-to-date
            </div>
            <p className="text-sm leading-relaxed text-slate-500 mb-4">
              Event dates sync automatically from Lisa&apos;s Google Calendar. Dates and locations update here as soon as they&apos;re posted.
            </p>
            {process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SUBSCRIBE_URL ? (
              <a
                href={buildSubscribeUrl(process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SUBSCRIBE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-950"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Subscribe to Calendar
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <CalendarPlus className="h-3.5 w-3.5" />
                Calendar subscription available soon
              </span>
            )}
          </div>
        </div>

        {/* ── Events List ── */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-16 text-center">
            <CalendarDays className="mx-auto mb-4 h-10 w-10 text-stone-300" />
            <p className="font-serif text-xl text-slate-400">No upcoming events scheduled yet.</p>
            <p className="mt-2 text-sm text-slate-400">Check back soon — Lisa posts new dates regularly.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                viewport={{ once: true }}
                className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
              >
                <DateBadge date={event.date} />

                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg font-bold text-slate-950 leading-snug">
                    {event.title}
                  </h3>
                  {event.location && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  <a
                    href={buildAddToCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-purple-600 transition-colors hover:text-slate-950"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Add to Calendar
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
