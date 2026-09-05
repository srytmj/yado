import rawIncidents from "@/data/incidents.json";

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
  currentStatus: "up" | "down" | "degraded";
  uptime90d: number; // e.g. 99.96
  avgLatencyMs: number;
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

// Generate deterministic 90-day timeline ending today
export function generate90DayBuckets(
  serviceId: string,
  baseUptime: number,
  specialDays: Record<number, { status: DayStatus; uptime: number; note: string }> = {}
): DailyUptimeBucket[] {
  const buckets: DailyUptimeBucket[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const iso = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (specialDays[i]) {
      buckets.push({
        date: iso,
        dayLabel,
        status: specialDays[i].status,
        uptimePercent: specialDays[i].uptime,
        incidentSummary: specialDays[i].note,
      });
    } else {
      buckets.push({
        date: iso,
        dayLabel,
        status: "operational",
        uptimePercent: 100,
      });
    }
  }

  return buckets;
}

// Services configuration with 90-day historical data
export function getTelemetryData(): {
  services: ServiceTelemetryRecord[];
  incidents: IncidentRecord[];
  overallUptime90d: number;
  networkAvgLatencyMs: number;
} {
  // SSO: minor maintenance 42 days ago
  const ssoBuckets = generate90DayBuckets("sso", 99.98, {
    42: {
      status: "maintenance",
      uptime: 99.8,
      note: "Planned OAuth2 cryptographic key rotation and token cache purge.",
    },
  });

  // Malas: elevated latency 18 days ago
  const malasBuckets = generate90DayBuckets("malas", 99.94, {
    18: {
      status: "degraded",
      uptime: 97.4,
      note: "High latency on OPDS catalog indexing during scheduled thumbnail re-encoding.",
    },
  });

  // libs: brief relay reconnect outage 64 days ago
  const libsBuckets = generate90DayBuckets("libs", 99.88, {
    64: {
      status: "outage",
      uptime: 94.2,
      note: "Yamux multiplexer tunnel drop during host network interface failover (24m).",
    },
    29: {
      status: "degraded",
      uptime: 98.6,
      note: "Transient rate-limiting on upstream metadata provider.",
    },
  });

  // Pore.js: static edge build, 100% uptime
  const poreBuckets = generate90DayBuckets("pore", 100, {});

  // Cloudflare / Gateway: 1 minor route latency 77 days ago
  const gatewayBuckets = generate90DayBuckets("gateway", 99.99, {
    77: {
      status: "degraded",
      uptime: 99.2,
      note: "Upstream edge BGP route renegotiation caused 3m brief re-routing.",
    },
  });

  const services: ServiceTelemetryRecord[] = [
    {
      id: "sso",
      name: "SSO Identity Provider",
      category: "Authentication",
      host: "sso.suryatmaja.dev",
      currentStatus: "up",
      uptime90d: 99.98,
      avgLatencyMs: 14,
      buckets: ssoBuckets,
    },
    {
      id: "malas",
      name: "Malas Library & Reader",
      category: "Content Portal",
      host: "malas.suryatmaja.dev",
      currentStatus: "up",
      uptime90d: 99.94,
      avgLatencyMs: 22,
      buckets: malasBuckets,
    },
    {
      id: "libs",
      name: "libs Tunnel & Broker",
      category: "Core Gateway",
      host: "libs.suryatmaja.dev",
      currentStatus: "up",
      uptime90d: 99.88,
      avgLatencyMs: 31,
      buckets: libsBuckets,
    },
    {
      id: "pore",
      name: "Pore.js Reader Engine",
      category: "Edge Application",
      host: "pore.suryatmaja.dev",
      currentStatus: "up",
      uptime90d: 100.0,
      avgLatencyMs: 6,
      buckets: poreBuckets,
    },
    {
      id: "gateway",
      name: "Edge Gateway & Ingress",
      category: "Infrastructure",
      host: "suryatmaja.dev",
      currentStatus: "up",
      uptime90d: 99.99,
      avgLatencyMs: 12,
      buckets: gatewayBuckets,
    },
  ];

  const incidents: IncidentRecord[] = rawIncidents as IncidentRecord[];

  const overallUptime90d = Number(
    (
      services.reduce((acc, s) => acc + s.uptime90d, 0) / services.length
    ).toFixed(2)
  );

  const networkAvgLatencyMs = Math.round(
    services.reduce((acc, s) => acc + s.avgLatencyMs, 0) / services.length
  );

  return {
    services,
    incidents,
    overallUptime90d,
    networkAvgLatencyMs,
  };
}
