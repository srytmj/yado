"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
import { StatusRow } from "@/components/status-row";
import { useHealth } from "@/hooks/use-health";

export function StatusDashboard() {
  const health = useHealth();

  const overall = services.every((s) => health?.services?.[s.id]?.status === "up")
    ? "up"
    : services.some((s) => health?.services?.[s.id]?.status === "down")
      ? "down"
      : "unknown";

  const overallLabel =
    overall === "up" ? "All systems operational" : overall === "down" ? "Degraded performance" : "Checking status…";

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03]"
      >
        <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <StatusDot status={overall} />
            <span className="text-sm font-medium text-foreground">{overallLabel}</span>
          </div>
          {health && (
            <span className="text-xs text-foreground/40">
              Updated {new Date(health.checkedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <ul className="divide-y divide-foreground/10">
          {services.map((service) => {
            const entry = health?.services?.[service.id];
            return (
              <StatusRow
                key={service.id}
                service={service}
                status={entry?.status ?? "unknown"}
                latencyMs={entry?.latencyMs ?? null}
              />
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
