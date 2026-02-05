"use client";

import Image from 'next/image';
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-rose-50 border-t border-b border-rose-100 mt-20 rounded-[2rem]">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* TEXT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-serif text-slate-900 font-bold">Meet the Maker</h2>
          <div className="w-16 h-1 bg-purple-600 rounded-full"></div>
          <p className="text-lg text-slate-700 leading-relaxed font-sans">
            Hi, I'm Lisa! Welcome to my creative corner.
          </p>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Every keychain in this shop is hand-woven by me with care and attention to detail.
              What started as a small hobby has grown into a passion for creating personalized,
              colorful accessories that brighten up your daily life.
            </p>
            <p>
              Whether you're looking for a simple splash of color or a custom name tag for your
              backpack, I put my heart into every knot. Thank you for supporting handmade!
            </p>
          </div>
          <div className="pt-4 font-serif text-2xl text-purple-800 italic">
            "Every Knot Tells a Story."
          </div>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 ease-out border-8 border-white">
            <Image
              src="/images/lisa_maker_profile.png"
              alt="Lisa - The Maker"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
