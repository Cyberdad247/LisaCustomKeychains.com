"use client";

import { CalendarDays, ExternalLink, Facebook, Instagram, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { type StorefrontConfig } from "@/lib/storefront-config";

const INSTAGRAM_URL = "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==";
const FACEBOOK_URL = "https://www.facebook.com/share/14WQBPgC1Rz/";

const baseEventChannels = (instagramUrl: string, facebookUrl: string) => [
  {
    title: "Pop-Up Announcements",
    description:
      "Follow Instagram for quick updates when Lisa is vending at local markets, craft fairs, school events, and weekend pop-ups.",
    action: "Watch Instagram",
    href: instagramUrl,
    icon: Instagram,
  },
  {
    title: "Shared Event Details",
    description:
      "Use Facebook for shared event posts, location reminders, vendor table updates, and community announcements.",
    action: "Open Facebook",
    href: facebookUrl,
    icon: Facebook,
  },
  {
    title: "What To Look For",
    description:
      "At live tables, shoppers can see finished keychains, sports charms, letter beads, and color options before ordering.",
    action: "Shop Custom Styles",
    href: "#products",
    icon: Sparkles,
  },
];

interface EventsSectionProps {
  section?: StorefrontConfig["homepageSections"][number];
  social?: StorefrontConfig["social"];
}

export default function EventsSection({ section, social }: EventsSectionProps) {
  const eventChannels = baseEventChannels(
    social?.instagramUrl || INSTAGRAM_URL,
    social?.facebookUrl || FACEBOOK_URL,
  );

  return (
    <section id="events" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-purple-100 bg-purple-50">
              <CalendarDays className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="font-serif text-4xl text-slate-950 md:text-5xl">
              {section?.headline || "Find Lisa at Pop-Up Events"}
            </h2>
            <p className="mt-4 max-w-2xl text-slate-500">
              {section?.body ||
                "Lisa posts vending dates, table previews, and last-minute pop-up details on social. Follow both pages so customers know where to find the charm table in person."}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin className="h-4 w-4 text-purple-600" />
              Live vending updates
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Event schedules can move quickly. Instagram and Facebook are the best places to confirm dates, times, location changes, and what Lisa is bringing to the table.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {eventChannels.map((channel, index) => {
            const Icon = channel.icon;

            return (
              <motion.article
                key={channel.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl text-slate-950">{channel.title}</h3>
                <p className="mt-3 min-h-[96px] text-sm leading-relaxed text-slate-500">{channel.description}</p>
                <a
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-950"
                >
                  {channel.action}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
