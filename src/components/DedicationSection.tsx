// 🐝 [HIVE_SWARM_STAMP] Autonomously Created by Forge Titan
import React from 'react';

export default function DedicationSection() {
    return (
        <section className="relative py-20 bg-stone-50 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-50"></div>

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h3 className="font-serif text-3xl text-purple-900 mb-2 italic">
                    In Loving Memory
                </h3>
                <p className="text-xl text-purple-700 font-medium mb-8">
                    Ann & Lashawn
                </p>

                <div className="space-y-6 text-slate-600 leading-relaxed font-light text-lg">
                    <p>
                        This collection is a tribute to the beautiful spirits of <strong>Ann and Lashawn</strong>.
                        Participating in the <strong>Cancer Walk</strong> in their honor reminds us that love and hope endure.
                    </p>
                    <p>
                        Their legacy is woven into every thread, and we walk together to celebrate their lives
                        and support the fight for a cure.
                    </p>
                </div>

                <div className="mt-12 flex justify-center">
                    <div className="h-1 w-24 bg-purple-200 rounded-full"></div>
                </div>
            </div>
        </section>
    );
}
