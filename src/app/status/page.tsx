"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getTelemetryData } from "@/lib/telemetry";
import { UptimeBarGraph } from "@/components/telemetry/uptime-bar-graph";
import { IncidentHistory } from "@/components/telemetry/incident-history";
import { useHealth } from "@/hooks/use-health";
import { StatusDot } from "@/components/status-dot";

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
  const { services, incidents, overallUptime90d, networkAvgLatencyMs } = getTelemetryData(health);

  const activeIncidents = incidents.filter((i) => {
    const latest = i.updates[0];
    return latest && latest.status !== "Resolved" && latest.status !== "Completed";
  });
  const anyDown = services.some((s) => s.currentStatus === "down");
  const overall: "operational" | "degraded" | "down" = anyDown
    ? "down"
    : activeIncidents.length > 0
      ? "degraded"
      : "operational";

  const banner =
    overall === "down"
      ? { label: "Partial Outage", detail: `${services.filter((s) => s.currentStatus === "down").length} service(s) unreachable`, className: "border-clay/20 bg-clay-soft text-clay" }
      : overall === "degraded"
        ? { label: "Degraded Performance", detail: `${activeIncidents.length} active incident(s)`, className: "border-ochre/20 bg-ochre-soft text-ochre" }
        : { label: "All Systems Operational", detail: "No active incidents", className: "border-moss/20 bg-moss-soft text-moss" };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-5xl px-6 pt-28 pb-20"
    >
      {/* Back Link */}
      <motion.div variants={item} className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-foreground/50 transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Back to Launcher</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header variants={item} className="mb-10 border-b border-hairline pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-foreground/45 mb-2">
              Live Telemetry
            </div>
            <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              System Telemetry & Health
            </h1>
            <p className="mt-2 text-sm text-foreground/60 leading-relaxed">
              Live availability, latency, and a 90-day incident history sourced from real probes and the incident log.
            </p>
          </div>

          {/* Auto-refresh Indicator */}
          <div className="flex items-center gap-2 border border-hairline px-4 py-2 font-mono text-xs text-foreground/50">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-moss ${isRefreshing ? "animate-ping opacity-100" : "opacity-0"}`} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
            </span>
            <span>{isRefreshing ? "Updating telemetry..." : `Auto-refresh: ${countdown}s`}</span>
          </div>
        </div>
      </motion.header>

      {/* Primary Status Banner */}
      <motion.div variants={item} className={`mb-10 flex items-center justify-between gap-4 border p-6 backdrop-blur-sm ${banner.className}`}>
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center border border-current/30">
            {overall === "operational" ? <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} /> : <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />}
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">{banner.label}</div>
            <div className="text-xs text-foreground/50 font-mono">
              Last probe: {health ? new Date(health.checkedAt).toLocaleTimeString() : "Probing..."}
            </div>
          </div>
        </div>

        <div className="hidden sm:block font-mono text-xs">{banner.detail}</div>
      </motion.div>

      {/* Metric Cards Ribbon */}
      <motion.div variants={item} className="mb-12 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
        <div className="bg-background p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-moss" strokeWidth={1.5} />
            <span>90-Day Uptime</span>
          </div>
          <div className="text-2xl font-mono tracking-tight text-foreground">{overallUptime90d}%</div>
          <p className="mt-1 text-[11px] text-foreground/40">Derived from incident log</p>
        </div>

        <div className="bg-background p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <Zap className="h-3.5 w-3.5 text-indigo" strokeWidth={1.5} />
            <span>Avg Latency</span>
          </div>
          <div className="text-2xl font-mono tracking-tight text-foreground">
            {networkAvgLatencyMs !== null ? `${networkAvgLatencyMs}ms` : "-"}
          </div>
          <p className="mt-1 text-[11px] text-foreground/40">Live probes only</p>
        </div>

        <div className="bg-background p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-ochre" strokeWidth={1.5} />
            <span>90d Incidents</span>
          </div>
          <div className="text-2xl font-mono tracking-tight text-foreground">{incidents.length} logged</div>
          <p className="mt-1 text-[11px] text-foreground/40">{activeIncidents.length} active</p>
        </div>

        <div className="bg-background p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/45 mb-1.5">
            <Server className="h-3.5 w-3.5 text-indigo" strokeWidth={1.5} />
            <span>Monitored Nodes</span>
          </div>
          <div className="text-2xl font-mono tracking-tight text-foreground">{services.length} endpoints</div>
          <p className="mt-1 text-[11px] text-foreground/40">Homelab & edge</p>
        </div>
      </motion.div>

      {/* 90-Day Service Uptime Bars */}
      <motion.section variants={item} className="mb-14">
        <div className="mb-6">
          <h2 className="font-serif text-xl tracking-tight text-foreground">
            Services & 90-Day Uptime History
          </h2>
          <p className="mt-1 text-xs text-foreground/50">
            Hover a bar to inspect that day. Days without a logged incident are assumed operational.
          </p>
        </div>

        <div className="divide-y divide-hairline border-y border-hairline">
          {services.map((service) => (
            <div key={service.id} className="py-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <StatusDot status={service.currentStatus} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{service.name}</span>
                      <span className="border border-hairline px-2 py-0.5 font-mono text-[10px] text-foreground/50">
                        {service.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-foreground/40">{service.host}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-foreground/40">
                    Latency: {service.avgLatencyMs !== null ? `~${service.avgLatencyMs}ms` : "no live probe"}
                  </span>
                  <span className="border border-moss/30 bg-moss-soft px-2 py-0.5 font-semibold text-moss">
                    {service.uptime90d}% uptime
                  </span>
                </div>
              </div>

              <UptimeBarGraph buckets={service.buckets} uptimePercent={service.uptime90d} />
            </div>
          ))}
        </div>
      </motion.section>

      {/* Live Probe Telemetry Inspector */}
      <motion.section variants={item} className="mb-14">
        <h2 className="font-serif text-xl tracking-tight text-foreground mb-4">Live Endpoint Probes</h2>
        <div className="border border-hairline">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-hairline text-foreground/50 font-mono uppercase">
              <tr>
                <th className="p-4 font-medium">Target Service</th>
                <th className="p-4 font-medium">Endpoint Host</th>
                <th className="p-4 font-medium">Current Probe</th>
                <th className="p-4 font-medium">Response Time</th>
                <th className="p-4 font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-foreground/[0.015] transition-colors">
                  <td className="p-4 font-medium text-foreground">{s.name}</td>
                  <td className="p-4 font-mono text-foreground/50">{s.host}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                      <StatusDot status={s.currentStatus} />
                      <span className={s.currentStatus === "up" ? "text-moss" : s.currentStatus === "down" ? "text-clay" : "text-foreground/45"}>
                        {s.currentStatus === "up" ? "Operational" : s.currentStatus === "down" ? "Unreachable" : "No live probe"}
                      </span>
                    </span>
                  </td>
                  <td className="p-4 font-mono text-foreground/60 tabular-nums">
                    {s.avgLatencyMs !== null ? `${s.avgLatencyMs}ms` : "-"}
                  </td>
                  <td className="p-4">
                    <a
                      href={`https://${s.host}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-foreground/45 hover:text-foreground transition-colors"
                    >
                      Visit <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* 90-Day Incident History Section */}
      <motion.section variants={item}>
        <div className="mb-6">
          <h2 className="font-serif text-xl tracking-tight text-foreground">
            90-Day Incident History & Maintenance Logs
          </h2>
          <p className="mt-1 text-xs text-foreground/50">
            Sourced directly from <code className="font-mono">src/data/incidents.json</code>.
          </p>
        </div>

        <IncidentHistory incidents={incidents} />
      </motion.section>

      {/* Footer Nav */}
      <motion.div variants={item} className="mt-16 pt-8 border-t border-hairline flex items-center justify-between text-xs text-foreground/40 font-mono">
        <span>Yado Telemetry &copy; {new Date().getFullYear()}</span>
        <Link href="/" className="hover:text-foreground transition-colors">
          Return to Launcher
        </Link>
      </motion.div>
    </motion.div>
  );
}
