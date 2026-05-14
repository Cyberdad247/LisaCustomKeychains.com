"use client";

import Image from "next/image";
import { ExternalLink, Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const INSTAGRAM_URL = "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==";
const FACEBOOK_URL = "https://www.facebook.com/share/14WQBPgC1Rz/";

const SOCIAL_CARDS = [
  {
    title: "Vendor Table Previews",
    description: "See what Lisa is packing before a pop-up: finished keychains, charm trays, yarn colors, and ready-to-buy pieces.",
    image: "https://i.postimg.cc/cvyv100W/Untitled_design_(2).png",
    imageAlt: "Finished Lisa's Custom Keychains arranged for a vendor table",
    objectPosition: "50% 45%",
  },
  {
    title: "Sports Charm Drops",
    description: "Watch for sports beads, school color ideas, and charm combinations that are available at live events.",
    image: "/images/assorted_charms_heritage.jpg",
    imageAlt: "Colorful sports charms and bead options for custom keychains",
    objectPosition: "68% 24%",
  },
  {
    title: "Custom Order Examples",
    description: "Check recent designs for names, initials, team colors, and gift ideas before choosing your own style.",
    image: "/images/sports/softball_mockup.jpg",
    imageAlt: "Personalized sports keychain with basketball charms and letter beads",
    objectPosition: "58% 54%",
  },
];

export default function SocialFeedSection() {
  return (
    <section className="overflow-hidden bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl">Follow the Next Pop-Up</h2>
            <p className="mt-4 max-w-2xl text-white/60">
              Social is where Lisa shows the freshest table photos, event reminders, sports charm options, and custom order examples.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950 transition-colors hover:bg-purple-100"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {SOCIAL_CARDS.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: card.objectPosition }}
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{card.description}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/65">
            For the most accurate vending schedule, check the latest Instagram and Facebook posts before leaving for an event.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950 transition-colors hover:bg-purple-100"
            >
              See Instagram Updates
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-purple-500"
            >
              See Facebook Updates
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
