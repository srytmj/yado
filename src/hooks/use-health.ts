"use client";

import { useEffect, useState } from "react";

type Status = "up" | "down" | "unknown";

interface HealthResponse {
  checkedAt: string;
  services: Record<string, { status: Status; latencyMs: number | null }>;
}

const POLL_INTERVAL_MS = 30_000;

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHealth() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) return;
        const data: HealthResponse = await res.json();
        if (!cancelled) setHealth(data);
      } catch {
        // keep last known status on transient failure
      }
    }

    fetchHealth();
    const id = setInterval(fetchHealth, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return health;
}
