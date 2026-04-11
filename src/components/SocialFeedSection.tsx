// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { Instagram, Facebook, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function SocialFeedSection() {
  return (
    <section className="py-24 bg-stone-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-purple-400 font-bold mb-3">
              Neural Network
            </h2>
            <p className="text-5xl font-serif">Follow the Thread</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 group">
              <Instagram className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
            </a>
            <a href="#" className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10 group">
              <Facebook className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
            </a>
          </div>
        </div>

        {/* Mock Social Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 0.98 }}
              className="relative aspect-square bg-white/5 rounded-3xl overflow-hidden group cursor-pointer border border-white/5"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a 
            href="https://www.etsy.com/shop/LisasCustomKeychainz" 
            target="_blank" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-purple-50 transition-colors"
          >
            Visit Our Etsy Spire <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
