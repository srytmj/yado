"use client";

import { CheckCircle2, AlertTriangle, Clock, Wrench } from "lucide-react";
import type { IncidentRecord } from "@/lib/telemetry";

const severityStyles: Record<IncidentRecord["severity"], { label: string; className: string; icon: typeof AlertTriangle }> = {
  minor: { label: "Minor Degraded", className: "border-ochre/30 bg-ochre-soft text-ochre", icon: AlertTriangle },
  major: { label: "Major Outage", className: "border-clay/30 bg-clay-soft text-clay", icon: AlertTriangle },
  maintenance: { label: "Maintenance", className: "border-indigo/30 bg-indigo-soft text-indigo", icon: Wrench },
};

export function IncidentHistory({ incidents }: { incidents: IncidentRecord[] }) {
  if (!incidents.length) {
    return (
      <div className="border border-hairline p-8 text-center text-sm text-foreground/50">
        No incidents reported in the past 90 days.
      </div>
    );
  }

  return (
    <div className="divide-y divide-hairline border-t border-hairline">
      {incidents.map((incident) => {
        const severity = severityStyles[incident.severity];
        const SeverityIcon = severity.icon;
        const latest = incident.updates[0];
        const isOpen = latest && latest.status !== "Resolved" && latest.status !== "Completed";

        return (
          <div key={incident.id} className="py-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 font-mono text-[11px] ${severity.className}`}>
                    <SeverityIcon className="h-3 w-3" strokeWidth={1.5} />
                    {severity.label}
                  </span>
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1 border border-clay/30 bg-clay-soft px-2.5 py-0.5 font-mono text-[11px] text-clay">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 border border-moss/30 bg-moss-soft px-2.5 py-0.5 font-mono text-[11px] text-moss">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                      Resolved
                    </span>
                  )}
                  <span className="text-xs font-mono text-foreground/45">{incident.serviceName}</span>
                </div>
                <h3 className="font-serif text-base text-foreground">{incident.title}</h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-foreground/45">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {incident.date}
                </span>
                <span>Duration: {incident.duration}</span>
              </div>
            </div>

            {/* Timeline Updates */}
            <div className="space-y-4">
              {incident.updates.map((update, idx) => (
                <div key={idx} className="relative flex items-start gap-3 text-xs">
                  <div className="flex h-5 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-mono text-foreground/50">
                      <span className="font-semibold text-foreground/80">{update.status}</span>
                      <span>/</span>
                      <span>{update.timestamp}</span>
                    </div>
                    <p className="mt-1 text-foreground/70 leading-relaxed font-sans">{update.message}</p>
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
