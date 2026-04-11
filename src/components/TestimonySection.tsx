// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah J.",
    location: "Cleveland, OH",
    text: "I ordered a custom keychain for my daughter's graduation and it turned out beautiful! The weaving is so tight and high-quality.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    location: "Etsy Customer",
    text: "The sports charms are awesome. Got a basketball one for my coach and he loved it. Fast shipping too!",
    stars: 5,
  },
  {
    name: "Elena R.",
    location: "Instagram Follower",
    text: "Lisa is so talented! I've bought three different ones now and they all look amazing on my bag.",
    stars: 5,
  },
];

export default function TestimonySection() {
  return (
    <section className="py-24 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-purple-600 font-bold mb-3">
            Voices of the Forge
          </h2>
          <p className="text-4xl font-serif text-slate-900">What Our Community Says</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 relative group hover:shadow-md transition-all"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-stone-50 group-hover:text-purple-50 transition-colors" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6 italic leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
