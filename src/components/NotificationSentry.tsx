"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle, X, Info } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((message: string, type: NotificationType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
                <AnimatePresence mode="popLayout">
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            layout
                            className={`
                pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-2xl border
                ${n.type === "success" ? "bg-white border-green-100 text-green-900" : ""}
                ${n.type === "error" ? "bg-rose-50 border-rose-100 text-rose-900" : ""}
                ${n.type === "info" ? "bg-white border-stone-100 text-slate-900" : ""}
                ${n.type === "warning" ? "bg-amber-50 border-amber-100 text-amber-900" : ""}
              `}
                        >
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${n.type === "success" ? "bg-green-100 text-green-600" : ""}
                ${n.type === "error" ? "bg-rose-100 text-rose-600" : ""}
                ${n.type === "info" ? "bg-purple-100 text-purple-600" : ""}
                ${n.type === "warning" ? "bg-amber-100 text-amber-600" : ""}
              `}>
                                {n.type === "success" && <CheckCircle2 size={20} />}
                                {n.type === "error" && <AlertCircle size={20} />}
                                {n.type === "info" && <Bell size={20} />}
                                {n.type === "warning" && <Info size={20} />}
                            </div>

                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">{n.type}</p>
                                <p className="text-sm font-medium leading-tight">{n.message}</p>
                            </div>

                            <button
                                onClick={() => removeNotification(n.id)}
                                className="hover:bg-black/5 p-1 rounded-lg transition-colors"
                                aria-label="Close notification"
                            >
                                <X size={16} className="opacity-40" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
