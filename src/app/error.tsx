"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCcw, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Log error to telemetry (Simulated)
        console.error("🔥 SYSTEMCRASH_SIG:", error);
    }, [error]);

    // Surface the real error so a crash can actually be diagnosed instead of
    // hiding behind a generic code. error.message never contains secrets —
    // it's the JS engine's description of what threw.
    const realMessage = error.message || "Unknown rendering error";
    const componentStack =
        (error as Error & { componentStack?: string }).componentStack || "";

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-rose-100 text-center space-y-6"
            >
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                    <AlertTriangle size={40} />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold text-slate-900 italic">"The Lattice has Frayed"</h2>
                    <p className="text-slate-500 text-sm">
                        A temporary system variance occurred. Our Paladins have been notified.
                    </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Code</p>
                    <p className="text-xs font-mono text-rose-600 break-all">{error.digest || "INTERNAL_VAR_0x99"}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
                        What broke
                    </p>
                    <p className="text-xs font-mono text-slate-800 break-words">{realMessage}</p>
                    {componentStack && (
                        <>
                            <button
                                onClick={() => setShowDetails((s) => !s)}
                                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900"
                            >
                                <ChevronDown size={14} className={showDetails ? "rotate-180" : ""} />
                                {showDetails ? "Hide" : "Show"} technical details
                            </button>
                            {showDetails && (
                                <pre className="mt-2 text-[10px] font-mono text-slate-600 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                                    {componentStack}
                                </pre>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={() => reset()}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-xl hover:shadow-purple-200"
                >
                    <RefreshCcw size={16} />
                    REINITIATE SYSTEM
                </button>
            </motion.div>
        </div>
    );
}
