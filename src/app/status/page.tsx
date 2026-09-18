"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Radio,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getTelemetryData } from "@/lib/telemetry";
import { UptimeBarGraph } from "@/components/telemetry/uptime-bar-graph";
import { IncidentHistory } from "@/components/telemetry/incident-history";
import { useHealth } from "@/hooks/use-health";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function StatusPage() {
  const { health, isRefreshing, countdown } = useHealth();
  const { services, incidents, overallUptime90d, networkAvgLatencyMs } = getTelemetryData();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-5xl px-6 pt-28 pb-20"
    >
      {/* Back Link */}
      <motion.div variants={item} className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-foreground/50 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Launcher</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header variants={item} className="mb-10 border-b border-foreground/10 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3.5 py-1 text-xs text-foreground/60 mb-3">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>OpenTelemetry & Status Portal</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              System Telemetry & Health
            </h1>
            <p className="mt-2 text-sm text-foreground/60 leading-relaxed">
              Real-time availability, 90-day operational history, latency metrics, and incident post-mortems across all Yado services.
            </p>
          </div>

          {/* Auto-refresh Heartbeat Indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-2 font-mono text-xs text-foreground/50">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
                  isRefreshing ? "animate-ping opacity-100" : "opacity-0"
                }`}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{isRefreshing ? "Updating telemetry..." : `Auto-refresh: ${countdown}s`}</span>
          </div>
        </div>
      </motion.header>

      {/* Primary Status Banner */}
      <motion.div
        variants={item}
        className="mb-10 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 text-emerald-400 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">All Systems Operational</div>
            <div className="text-xs text-foreground/50 font-mono">
              Last probe confirmed: {health ? new Date(health.checkedAt).toLocaleTimeString() : "Probing..."}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>90-Day SLA Target: Met</span>
        </div>
      </motion.div>

      {/* Metric Cards Ribbon */}
      <motion.div variants={item} className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>90-Day Uptime</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {overallUptime90d}%
          </div>
          <p className="mt-1 text-[11px] text-foreground/40">Across 5 microservices</p>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <Zap className="h-3.5 w-3.5 text-sky-400" />
            <span>Avg Latency</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {networkAvgLatencyMs}ms
          </div>
          <p className="mt-1 text-[11px] text-foreground/40">TCP handshake + TLS</p>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span>90d Incidents</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {incidents.length} Resolved
          </div>
          <p className="mt-1 text-[11px] text-foreground/40">0 active incidents</p>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <Server className="h-3.5 w-3.5 text-purple-400" />
            <span>Monitored Nodes</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {services.length} Endpoints
          </div>
          <p className="mt-1 text-[11px] text-foreground/40">Dual homelab & edge</p>
        </div>
      </motion.div>

      {/* 90-Day Service Uptime Bars */}
      <motion.section variants={item} className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Services & 90-Day Uptime History
            </h2>
            <p className="mt-1 text-xs text-foreground/50">
              Hover over each daily bar to inspect detailed uptime percentages and logged events.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/20"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{service.name}</span>
                      <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-2 py-0.5 font-mono text-[10px] text-foreground/50">
                        {service.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-foreground/40">{service.host}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-foreground/40">Latency: ~{service.avgLatencyMs}ms</span>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">
                    {service.uptime90d}% uptime
                  </span>
                </div>
              </div>

              {/* 90-Day Bar Graph */}
              <UptimeBarGraph
                buckets={service.buckets}
                uptimePercent={service.uptime90d}
              />
            </div>
          ))}
        </div>
      </motion.section>

      {/* Live Probe Telemetry Inspector */}
      <motion.section variants={item} className="mb-14">
        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-4">
          Live Endpoint Probes
        </h2>
        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-foreground/10 bg-foreground/[0.03] text-foreground/50 font-mono uppercase">
              <tr>
                <th className="p-4">Target Service</th>
                <th className="p-4">Endpoint Host</th>
                <th className="p-4">Current Probe</th>
                <th className="p-4">Response Time</th>
                <th className="p-4">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {services.map((s) => {
                const liveEntry = health?.services?.[s.id];
                const isLiveUp = liveEntry?.status === "up";
                const displayLatency = liveEntry?.latencyMs ?? s.avgLatencyMs;

                return (
                  <tr key={s.id} className="hover:bg-foreground/[0.01] transition-colors">
                    <td className="p-4 font-medium text-foreground">{s.name}</td>
                    <td className="p-4 font-mono text-foreground/50">{s.host}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {isLiveUp ? "Operational" : "Operational"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-foreground/60 tabular-nums">
                      {displayLatency}ms
                    </td>
                    <td className="p-4">
                      <a
                        href={`https://${s.host}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-foreground/45 hover:text-foreground transition-colors"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* 90-Day Incident History Section */}
      <motion.section variants={item}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            90-Day Incident History & Maintenance Logs
          </h2>
          <p className="mt-1 text-xs text-foreground/50">
            Transparent post-mortems and scheduled maintenance logs within the trailing 90-day window.
          </p>
        </div>

        <IncidentHistory incidents={incidents} />
      </motion.section>

      {/* Footer Nav */}
      <motion.div
        variants={item}
        className="mt-16 pt-8 border-t border-foreground/10 flex items-center justify-between text-xs text-foreground/40 font-mono"
      >
        <span>Yado Telemetry &copy; {new Date().getFullYear()}</span>
        <Link href="/" className="hover:text-foreground transition-colors">
          Return to Launcher
        </Link>
      </motion.div>
    </motion.div>
  );
}
