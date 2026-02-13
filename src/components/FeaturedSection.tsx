'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function FeaturedSection() {
    return (
        <section className="py-12 md:py-24 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-50 via-white to-rose-50 rounded-[2.5rem] border border-purple-100/50 shadow-2xl shadow-purple-900/5 p-8 md:p-12 lg:p-16 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-600/20 rounded-full text-purple-700 text-[10px] font-black tracking-[0.2em] uppercase">
                            <Sparkles className="w-3 h-3" />
                            Featured This Week
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-6xl font-serif text-slate-900 leading-[1.1]">
                                Handcrafted <br />
                                <span className="text-purple-600 italic">Heart Bead</span> Earrings
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                                Fresh from the loom. Our latest collection of macramé earrings features
                                vibrant threads and playful heart-shaped beads. Six stunning colorways
                                designed to match every outfit and mood.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    const productsSection = document.getElementById('products');
                                    if (productsSection) {
                                        productsSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-purple-700 transition-all shadow-xl shadow-slate-900/20"
                            >
                                Customize Your Pair
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-purple-100/50">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-purple-50 flex items-center justify-center text-lg shadow-sm">
                                        {['❤️', '⭐', '🦋', '🌸'][i - 1]}
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Handcrafted with <br /> Premium Charms
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative group lg:-mr-12"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-purple-400 to-rose-400 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity rounded-[3rem]" />
                        <div className="bg-white p-4 rounded-[3rem] shadow-2xl relative border border-white observation-perspective">
                            <div className="relative aspect-[4/5] rounded-[2.2rem] overflow-hidden grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 shadow-inner">
                                <Image
                                    src="/featured-earrings.jpg"
                                    alt="Handcrafted Macramé Earrings with Heart Beads"
                                    fill
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-full shadow-2xl border border-stone-50 flex flex-col items-center justify-center text-center p-2 z-20"
                        >
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-tight">Hand <br /> Made</span>
                            <div className="w-4 h-[1px] bg-stone-200 my-1" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Premium</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
