import rawIncidents from "@/data/incidents.json";
import type { HealthResponse } from "@/hooks/use-health";

export type DayStatus = "operational" | "degraded" | "outage" | "maintenance";

export interface DailyUptimeBucket {
  date: string; // ISO YYYY-MM-DD
  dayLabel: string; // e.g. "Aug 14, 2026"
  status: DayStatus;
  uptimePercent: number; // e.g. 100 or 98.4
  incidentSummary?: string;
}

export interface ServiceTelemetryRecord {
  id: string;
  name: string;
  category: string;
  host: string;
  currentStatus: "up" | "down" | "unknown";
  avgLatencyMs: number | null;
  uptime90d: number; // e.g. 99.96, derived from buckets below
  buckets: DailyUptimeBucket[];
}

export interface IncidentUpdate {
  timestamp: string;
  status: "Investigating" | "Identified" | "Monitoring" | "Resolved" | "Completed";
  message: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  date: string; // e.g. "August 24, 2026"
  severity: "minor" | "major" | "maintenance";
  serviceId: string;
  serviceName: string;
  duration: string;
  updates: IncidentUpdate[];
}

const SERVICE_META: Record<string, { name: string; category: string; host: string }> = {
  sso: { name: "SSO Identity Provider", category: "Authentication", host: "sso.yado.my.id" },
  malas: { name: "Malas Library & Reader", category: "Content Portal", host: "malas.yado.my.id" },
  libs: { name: "libs Tunnel & Broker", category: "Core Gateway", host: "libs.yado.my.id" },
  pore: { name: "Pore.js Reader Engine", category: "Edge Application", host: "pore.yado.my.id" },
  gateway: { name: "Edge Gateway & Ingress", category: "Infrastructure", host: "yado.my.id" },
};

const SERVICE_ORDER = ["sso", "malas", "libs", "pore", "gateway"];

// incidents.json stores dates as "Today (...)" or "N days ago" (see
// scripts/incident-cli.mjs) - convert that to an offset on the rolling
// 90-day grid. Anything else (a hand-edited absolute date) can't be placed
// on the grid, so it's left out of the bar graph but still shows in the
// incident history list below.
function parseIncidentDayOffset(date: string): number | null {
  if (/^today/i.test(date)) return 0;
  const match = date.match(/^(\d+)\s+days?\s+ago$/i);
  return match ? Number(match[1]) : null;
}

function parseDurationMinutes(duration: string): number {
  const hours = duration.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minutes = duration.match(/(\d+(?:\.\d+)?)\s*m/i);
  const total = (hours ? parseFloat(hours[1]) * 60 : 0) + (minutes ? parseFloat(minutes[1]) : 0);
  return total || 0;
}

function severityToDayStatus(severity: IncidentRecord["severity"]): DayStatus {
  if (severity === "major") return "outage";
  if (severity === "maintenance") return "maintenance";
  return "degraded";
}

// Builds a real 90-day bucket timeline for a service from incidents.json.
// A day with no logged incident defaults to operational/100% - the same
// "silence means healthy" convention every status page (Statuspage,
// Cachet, etc.) uses, since there is no separate historical probe log to
// consult here.
function buildBuckets(serviceId: string, incidents: IncidentRecord[]): DailyUptimeBucket[] {
  const today = new Date();
  const overrides = new Map<number, { status: DayStatus; uptime: number; note: string }>();

  for (const incident of incidents) {
    if (incident.serviceId !== serviceId) continue;
    const offset = parseIncidentDayOffset(incident.date);
    if (offset === null || offset < 0 || offset > 89) continue;

    const minutes = parseDurationMinutes(incident.duration);
    const uptime = Math.max(0, Math.round((100 - (minutes / 1440) * 100) * 10) / 10);
    const status = severityToDayStatus(incident.severity);

    const existing = overrides.get(offset);
    if (!existing || uptime < existing.uptime) {
      overrides.set(offset, { status, uptime, note: incident.title });
    }
  }

  const buckets: DailyUptimeBucket[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const override = overrides.get(i);

    buckets.push(
      override
        ? { date: iso, dayLabel, status: override.status, uptimePercent: override.uptime, incidentSummary: override.note }
        : { date: iso, dayLabel, status: "operational", uptimePercent: 100 }
    );
  }
  return buckets;
}

// `liveHealth` is the response from /api/health (see useHealth()) - current
// status and latency are read straight from it rather than stored here, so
// this stays in sync with the real probes instead of a fixed snapshot.
export function getTelemetryData(liveHealth?: HealthResponse | null): {
  services: ServiceTelemetryRecord[];
  incidents: IncidentRecord[];
  overallUptime90d: number;
  networkAvgLatencyMs: number | null;
} {
  const incidents: IncidentRecord[] = rawIncidents as IncidentRecord[];

  const services: ServiceTelemetryRecord[] = SERVICE_ORDER.map((id) => {
    const meta = SERVICE_META[id];
    const buckets = buildBuckets(id, incidents);
    const uptime90d = Number(
      (buckets.reduce((acc, b) => acc + b.uptimePercent, 0) / buckets.length).toFixed(2)
    );

    const live = liveHealth?.services?.[id];

    return {
      id,
      ...meta,
      currentStatus: live?.status ?? "unknown",
      avgLatencyMs: live?.latencyMs ?? null,
      uptime90d,
      buckets,
    };
  });

  const knownLatencies = services
    .map((s) => s.avgLatencyMs)
    .filter((v): v is number => v !== null);
  const networkAvgLatencyMs = knownLatencies.length
    ? Math.round(knownLatencies.reduce((a, b) => a + b, 0) / knownLatencies.length)
    : null;

  const overallUptime90d = Number(
    (services.reduce((acc, s) => acc + s.uptime90d, 0) / services.length).toFixed(2)
  );

  return { services, incidents, overallUptime90d, networkAvgLatencyMs };
}
