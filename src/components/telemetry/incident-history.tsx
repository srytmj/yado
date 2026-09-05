"use client";

import { CheckCircle2, AlertTriangle, Clock, Wrench } from "lucide-react";
import type { IncidentRecord } from "@/lib/telemetry";

export function IncidentHistory({ incidents }: { incidents: IncidentRecord[] }) {
  if (!incidents.length) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center text-sm text-foreground/50">
        No incidents reported in the past 90 days.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {incidents.map((incident) => {
        let severityBadge = (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </span>
        );

        if (incident.severity === "minor") {
          severityBadge = (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Minor Degraded
            </span>
          );
        } else if (incident.severity === "major") {
          severityBadge = (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[11px] text-rose-400">
              <AlertTriangle className="h-3 w-3" />
              Major Outage
            </span>
          );
        } else if (incident.severity === "maintenance") {
          severityBadge = (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 font-mono text-[11px] text-sky-400">
              <Wrench className="h-3 w-3" />
              Maintenance
            </span>
          );
        }

        return (
          <div
            key={incident.id}
            className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/20"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {severityBadge}
                  <span className="text-xs font-mono text-foreground/45">{incident.serviceName}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{incident.title}</h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-foreground/45">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {incident.date}
                </span>
                <span>Duration: {incident.duration}</span>
              </div>
            </div>

            {/* Timeline Updates */}
            <div className="mt-5 space-y-4">
              {incident.updates.map((update, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  <div className="flex h-5 items-center">
                    <span className="h-2 w-2 rounded-full bg-foreground/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-mono text-foreground/50">
                      <span className="font-semibold text-foreground/80">{update.status}</span>
                      <span>•</span>
                      <span>{update.timestamp}</span>
                    </div>
                    <p className="mt-1 text-foreground/70 leading-relaxed font-sans">
                      {update.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
