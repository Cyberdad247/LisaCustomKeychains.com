// 🐝 [HIVE_SWARM_STAMP] Autonomously Created by Anya Sharma
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PolaroidWrapperProps {
    children: ReactNode;
    className?: string;
    rotation?: number;
}

export default function PolaroidWrapper({
    children,
    className,
    rotation = 0,
}: PolaroidWrapperProps) {
    return (
        <div
            className={cn("polaroid relative z-10", className)}
            style={{
                "--rotation": `${rotation}deg`,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}
