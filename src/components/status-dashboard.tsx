"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
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
    <section id="status" className="mx-auto max-w-5xl px-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <StatusDot status={overall} />
            <span className="text-sm font-medium text-white">{overallLabel}</span>
          </div>
          {health && (
            <span className="text-xs text-white/40">
              Updated {new Date(health.checkedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <ul className="divide-y divide-white/10">
          {services.map((service) => {
            const entry = health?.services?.[service.id];
            const status = entry?.status ?? "unknown";
            return (
              <li key={service.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <StatusDot status={status} />
                  <span className="text-sm text-white/80">{service.name}</span>
                </div>
                <span className="text-xs text-white/40">
                  {status === "unknown"
                    ? "—"
                    : status === "up"
                      ? `${entry?.latencyMs ?? "—"}ms`
                      : "unreachable"}
                </span>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
