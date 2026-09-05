"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DailyUptimeBucket } from "@/lib/telemetry";

interface UptimeBarGraphProps {
  buckets: DailyUptimeBucket[];
  uptimePercent: number;
}

export function UptimeBarGraph({ buckets, uptimePercent }: UptimeBarGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeBucket = hoveredIndex !== null ? buckets[hoveredIndex] : null;

  return (
    <div className="relative w-full">
      {/* 90-Day Horizontal Bar Grid */}
      <div
        className="flex items-center gap-[2px] sm:gap-[3px] py-1"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {buckets.map((bucket, index) => {
          let bgClass = "bg-emerald-500/80 hover:bg-emerald-400";
          if (bucket.status === "degraded") {
            bgClass = "bg-amber-500/85 hover:bg-amber-400";
          } else if (bucket.status === "outage") {
            bgClass = "bg-rose-500/90 hover:bg-rose-400";
          } else if (bucket.status === "maintenance") {
            bgClass = "bg-sky-500/85 hover:bg-sky-400";
          }

          const isHovered = hoveredIndex === index;

          return (
            <div
              key={bucket.date}
              onMouseEnter={() => setHoveredIndex(index)}
              className="relative flex-1 group cursor-pointer py-1"
            >
              <div
                className={`h-8 w-full rounded-[2px] transition-all duration-150 ${bgClass} ${
                  isHovered ? "scale-y-110 opacity-100 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "opacity-75 hover:opacity-100"
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
            className="pointer-events-none absolute -top-16 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-foreground/15 bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-foreground">{activeBucket.dayLabel}</span>
              <span className="text-foreground/30">•</span>
              <span
                className={`flex items-center gap-1 font-medium ${
                  activeBucket.status === "operational"
                    ? "text-emerald-400"
                    : activeBucket.status === "degraded"
                      ? "text-amber-400"
                      : activeBucket.status === "outage"
                        ? "text-rose-400"
                        : "text-sky-400"
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    activeBucket.status === "operational"
                      ? "bg-emerald-400"
                      : activeBucket.status === "degraded"
                        ? "bg-amber-400"
                        : activeBucket.status === "outage"
                          ? "bg-rose-400"
                          : "bg-sky-400"
                  }`}
                />
                {activeBucket.status === "operational"
                  ? "Operational"
                  : activeBucket.status === "degraded"
                    ? "Degraded Performance"
                    : activeBucket.status === "outage"
                      ? "Outage"
                      : "Maintenance"}
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
