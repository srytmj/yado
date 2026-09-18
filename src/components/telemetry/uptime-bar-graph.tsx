"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DailyUptimeBucket } from "@/lib/telemetry";

interface UptimeBarGraphProps {
  buckets: DailyUptimeBucket[];
  uptimePercent: number;
}

const statusBg: Record<DailyUptimeBucket["status"], string> = {
  operational: "bg-moss/80 hover:bg-moss",
  degraded: "bg-ochre/85 hover:bg-ochre",
  outage: "bg-clay/90 hover:bg-clay",
  maintenance: "bg-indigo/85 hover:bg-indigo",
};

const statusText: Record<DailyUptimeBucket["status"], string> = {
  operational: "text-moss",
  degraded: "text-ochre",
  outage: "text-clay",
  maintenance: "text-indigo",
};

const statusDot: Record<DailyUptimeBucket["status"], string> = {
  operational: "bg-moss",
  degraded: "bg-ochre",
  outage: "bg-clay",
  maintenance: "bg-indigo",
};

const statusLabel: Record<DailyUptimeBucket["status"], string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  outage: "Outage",
  maintenance: "Maintenance",
};

export function UptimeBarGraph({ buckets, uptimePercent }: UptimeBarGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeBucket = hoveredIndex !== null ? buckets[hoveredIndex] : null;

  return (
    <div className="relative w-full">
      {/* 90-Day Horizontal Bar Grid */}
      <div className="flex items-center gap-[2px] sm:gap-[3px] py-1" onMouseLeave={() => setHoveredIndex(null)}>
        {buckets.map((bucket, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={bucket.date}
              onMouseEnter={() => setHoveredIndex(index)}
              className="relative flex-1 group cursor-pointer py-1"
            >
              <div
                className={`h-7 w-full transition-all duration-150 ${statusBg[bucket.status]} ${
                  isHovered ? "scale-y-110 opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Detailed Tooltip */}
      <AnimatePresence>
        {activeBucket && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute -top-16 left-1/2 z-30 -translate-x-1/2 border border-hairline bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-foreground">{activeBucket.dayLabel}</span>
              <span className="text-foreground/30">/</span>
              <span className={`flex items-center gap-1 font-medium ${statusText[activeBucket.status]}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot[activeBucket.status]}`} />
                {statusLabel[activeBucket.status]}
              </span>
              <span className="text-foreground/45">({activeBucket.uptimePercent}% uptime)</span>
            </div>

            {activeBucket.incidentSummary && (
              <p className="mt-1 text-[11px] text-foreground/70 max-w-xs font-sans">
                {activeBucket.incidentSummary}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Axis Footer */}
      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-foreground/45">
        <span>90 days ago</span>
        <span className="font-medium text-foreground/70">{uptimePercent.toFixed(2)}% uptime</span>
        <span>Today</span>
      </div>
    </div>
  );
}
