"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Palette, Sparkles, Trophy } from "lucide-react";

const CHARM_PHOTOS = [
  {
    src: "/images/charms-gallery-1.jpg",
    alt: "Assorted charm examples including sports beads, colorful bow charms, and sparkle spacer beads",
    title: "Sports, Sparkle, and Color",
    description: "A broad example table for sports themes, bright bead colors, novelty charms, and accent pieces.",
    objectPosition: "50% 48%",
  },
  {
    src: "/images/charms-gallery-2.jpg",
    alt: "Loose heart, star, butterfly, flower, and sports charms for custom keychain choices",
    title: "Hearts, Stars, Flowers, and Game Day Picks",
    description: "Use this as inspiration for the charm style, color mood, and theme you want Lisa to match.",
    objectPosition: "50% 42%",
  },
];

const CHARM_TYPES = [
  { label: "Sports", icon: Trophy },
  { label: "Hearts", icon: Heart },
  { label: "Colors", icon: Palette },
  { label: "Sparkle", icon: Sparkles },
];

export default function HeritageSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-purple-700">
              Charm Example Gallery
            </p>
            <h2 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              Pick a charm direction before Lisa builds the keychain.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
              These photos are examples of charms that can be used. Choose a theme, color mood, or sport style, then customize the finished keychain in the collection below.
            </p>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
            viewport={{ once: true }}
            href="#products"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-slate-950 px-7 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all duration-300 hover:bg-purple-700"
          >
            Start customizing
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {CHARM_PHOTOS.map((photo, index) => (
            <motion.article
              key={photo.src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: photo.objectPosition }}
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl text-slate-950">{photo.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{photo.description}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-8 grid gap-3 sm:grid-cols-4"
        >
          {CHARM_TYPES.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700"
            >
              <Icon className="h-4 w-4 text-purple-700" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
