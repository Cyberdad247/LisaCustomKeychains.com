// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const POSTS = [
  {
    title: "The Art of the Infinite Knot",
    excerpt: "Discover the history behind the weaving patterns used in our signature keychains...",
    category: "Craftsmanship",
    date: "Apr 10, 2026",
    image: "https://images.unsplash.com/photo-1515564416985-f1c1f7aa58ad?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Team Spirit: Beyond the Charms",
    excerpt: "Why custom keychains have become the ultimate gift for high school sports teams...",
    category: "Community",
    date: "Apr 05, 2026",
    image: "https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&q=80&w=800",
  },
];

export default function BlogSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-purple-600 font-bold mb-3">
            The Chronicle
          </h2>
          <p className="text-5xl font-serif text-slate-900">Forge Stories</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {POSTS.map((post, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] mb-8 bg-stone-100 shadow-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-purple-700">
                  {post.category}
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{post.date}</p>
              <h3 className="text-3xl font-serif text-slate-900 mb-4 group-hover:text-purple-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-500 mb-6 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-900 group-hover:translate-x-2 transition-transform">
                Read Narrative <ArrowRight className="w-4 h-4" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
