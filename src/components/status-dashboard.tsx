"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";
import { services } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
import { StatusRow } from "@/components/status-row";
import { useHealth } from "@/hooks/use-health";

export function StatusDashboard() {
  const { health, isRefreshing, countdown } = useHealth();

  const overall = services.every((s) => health?.services?.[s.id]?.status === "up")
    ? "up"
    : services.some((s) => health?.services?.[s.id]?.status === "down")
      ? "down"
      : "unknown";

  const overallLabel =
    overall === "up"
      ? "All systems operational"
      : overall === "down"
        ? "Partial system outage"
        : "Checking status...";

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground/45 mb-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>System Telemetry & Health</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          System Status
        </h2>
        <p className="mt-1 text-sm text-foreground/50">
          Periodic latency and availability tracking across all microservices.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <StatusDot status={overall} />
            <span className="text-sm font-medium text-foreground">{overallLabel}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-foreground/45">
            {health && (
              <span>
                Updated: {new Date(health.checkedAt).toLocaleTimeString()}
              </span>
            )}

            {/* Auto-refresh Heartbeat Indicator */}
            <div className="flex items-center gap-1.5 rounded-md border border-foreground/10 bg-foreground/[0.03] px-2 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
                    isRefreshing ? "animate-ping opacity-100" : "opacity-0"
                  }`}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>
                {isRefreshing ? "Updating..." : `Auto-refresh: ${countdown}s`}
              </span>
            </div>
          </div>
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

        {/* Link to Dedicated Status Page */}
        <div className="flex items-center justify-between border-t border-foreground/10 bg-foreground/[0.01] px-6 py-3.5 text-xs">
          <span className="text-foreground/45">Historical SLA & Incident Logs</span>
          <Link
            href="/status"
            className="inline-flex items-center gap-1.5 font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            <span>View 90-day uptime & telemetry</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
