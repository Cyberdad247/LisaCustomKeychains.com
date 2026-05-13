"use client";

import Image from 'next/image';
import { motion } from "framer-motion";
import { ArrowRight, Palette, Sparkles } from "lucide-react";

export default function HeritageSection() {
    const legacyPhotos = [
        {
            src: "https://i.postimg.cc/cvyv100W/Untitled_design_(2).png",
            alt: "Lisa's Custom Keychains legacy table with finished bracelet keychains and bead sets",
            label: "Finished keychain stories",
        },
        {
            src: "/images/assorted_charms_heritage.jpg",
            alt: "Assorted sports, heart, flower, star, and butterfly charms for custom keychain designs",
            label: "Charm choices that started it",
        },
    ];

    return (
        <section className="py-24 bg-white mt-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="grid gap-5 sm:grid-cols-[1fr_0.58fr]">
                            <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                                <div className="relative aspect-[4/5] sm:aspect-[4/5]">
                                    <Image
                                        src={legacyPhotos[0].src}
                                        alt={legacyPhotos[0].alt}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 54vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4 px-5 py-4">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                                        {legacyPhotos[0].label}
                                    </p>
                                    <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                                    <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                                        <Image
                                            src={legacyPhotos[1].src}
                                            alt={legacyPhotos[1].alt}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 28vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <p className="px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                                        {legacyPhotos[1].label}
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-stone-200 bg-slate-950 p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
                                        Made to Match
                                    </p>
                                    <p className="mt-3 text-2xl font-serif italic leading-tight">
                                        Start with a charm. Finish with something that feels like you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-600">
                                Where the legacy began
                            </p>
                            <h2 className="text-5xl md:text-6xl font-serif text-slate-950 font-bold leading-[1.02]">
                                A Legacy of <span className="text-purple-700">Curated Charms</span>
                            </h2>
                            <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-purple-700 via-rose-500 to-amber-400"></div>
                        </div>

                        <div className="space-y-5 text-lg leading-8 text-slate-600">
                            <p>
                                Every piece starts with a simple choice: the cord, the colors, the beads, and the charm that says something personal.
                            </p>
                            <p>
                                Sports beads, bright hearts, flowers, butterflies, sparkle rings, letter beads, and custom requests all belong in the same design table. If the exact charm is not shown, Lisa can help shape the idea.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                                <Palette className="mb-4 h-5 w-5 text-purple-700" />
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Pick the mood</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Choose color, theme, charm type, and personal details.</p>
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                                <Sparkles className="mb-4 h-5 w-5 text-amber-500" />
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Make it yours</p>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Turn the charm table into a finished keychain story.</p>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-4 items-start">
                            <div className="inline-flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-700 text-xl font-bold text-white">L</div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Lisa's Selection</p>
                                    <p className="text-xs text-slate-500">Hand-curated with the story in mind.</p>
                                </div>
                            </div>

                            <a
                                href="#products"
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all duration-300 hover:bg-purple-700"
                            >
                                Explore the collection
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
