"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-foreground/45 mb-2">
          Live Telemetry
        </div>
        <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          System Status
        </h2>
        <p className="mt-1.5 text-sm text-foreground/50">
          Live latency and availability across every service, polled continuously.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border-y border-hairline"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
          <div className="flex items-center gap-2.5">
            <StatusDot status={overall} />
            <span className="text-sm font-medium text-foreground">{overallLabel}</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-foreground/45">
            {health && <span>Updated: {new Date(health.checkedAt).toLocaleTimeString()}</span>}

            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-moss ${isRefreshing ? "animate-ping opacity-100" : "opacity-0"}`} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
              </span>
              <span>{isRefreshing ? "Updating..." : `Auto-refresh: ${countdown}s`}</span>
            </div>
          </div>
        </div>

        <ul className="divide-y divide-hairline">
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
        <div className="flex items-center justify-between border-t border-hairline px-6 py-3.5 text-xs">
          <span className="text-foreground/45">Historical uptime & incident log</span>
          <Link href="/status" className="inline-flex items-center gap-1.5 font-medium text-foreground/70 transition-colors hover:text-foreground">
            <span>View 90-day telemetry</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
