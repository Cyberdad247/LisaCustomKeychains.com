// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

const EVENTS = [
  {
    title: "Cleveland Summer Craft Fair",
    date: "June 15, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Public Square, Cleveland",
    description: "Catch us live at the square! We'll have a custom-weaving station set up for on-the-spot orders.",
  },
  {
    title: "Handmade Holiday Workshop",
    date: "July 2, 2026",
    time: "1:00 PM - 3:00 PM",
    location: "Art Studio West",
    description: "Learn the basics of macramé weaving and help Lisa create a community tapestry.",
  },
];

export default function EventsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-purple-600 font-bold mb-3">
              The Living Ledger
            </h2>
            <p className="text-5xl font-serif text-slate-900">Upcoming Events</p>
          </div>
          <p className="text-slate-500 max-w-sm text-right hidden md:block">
            Come visit our physical forge and see the weaving process in person.
          </p>
        </div>

        <div className="space-y-6">
          {EVENTS.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group flex flex-col md:grid md:grid-cols-12 gap-8 p-8 bg-stone-50 rounded-[3rem] border border-stone-100 hover:border-purple-200 transition-all cursor-pointer"
            >
              <div className="md:col-span-3">
                <p className="text-2xl font-serif text-slate-900">{event.date}</p>
                <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{event.time}</span>
                </div>
              </div>
              
              <div className="md:col-span-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{event.description}</p>
              </div>

              <div className="md:col-span-3 flex items-start md:justify-end">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-200 shadow-sm text-slate-600">
                  <MapPin className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-tight">{event.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
