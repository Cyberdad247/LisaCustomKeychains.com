"use client";

import Image from 'next/image';
import { motion } from "framer-motion";

export default function HeritageSection() {
    return (
        <section className="py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] mt-24 border border-stone-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* IMAGE SIDE */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] md:aspect-square w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group">
                            <Image
                                src="/images/assorted_charms_heritage.jpg"
                                alt="The Heritage - Assorted Charms"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-80 mb-2">Heritage Discovery</p>
                                <h3 className="text-2xl font-serif italic">"Where the legacy began."</h3>
                            </div>
                        </div>

                        {/* Decorative Element */}
                        <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700"></div>
                    </motion.div>

                    {/* TEXT SIDE */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-5xl font-serif text-slate-950 font-bold leading-tight">
                                A Legacy of <span className="text-purple-600">Curated Charms</span>
                            </h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-purple-600 to-rose-400 rounded-full"></div>
                        </div>

                        <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-sans">
                            <p>
                                This collection of assorted charms holds a special place in my heart.
                                It traces back through my family, representing the small tokens of
                                joy and memories passed down from my grandfather.
                            </p>
                            <p>
                                He taught me that even the smallest object can carry the weight
                                of a lifetime of stories. Every charm we offer today is selected
                                with that same spirit—to be a tiny anchor for your own adventures.
                            </p>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row gap-6 items-start">
                            <div className="inline-flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    L
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Lisa's Selection</p>
                                    <p className="text-xs text-slate-500">Hand-curated with Heritage in mind.</p>
                                </div>
                            </div>

                            <a
                                href="#products"
                                className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-purple-700 transition-all duration-300 shadow-xl hover:shadow-purple-200"
                            >
                                EXPLORE THE COLLECTION
                            </a>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
