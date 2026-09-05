"use client";

import { useEffect, useState } from "react";

export type Status = "up" | "down" | "unknown";

export interface HealthResponse {
  checkedAt: string;
  services: Record<string, { status: Status; latencyMs: number | null }>;
}

const INTERVAL_SECONDS = 30;

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(INTERVAL_SECONDS);

  useEffect(() => {
    let cancelled = false;

    async function fetchApi() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) return;
        const data: HealthResponse = await res.json();
        if (!cancelled) {
          setHealth(data);
        }
      } catch {
        // keep last known state
      }
    }

    // Initial fetch
    fetchApi();

    // 30s background poll
    const pollId = setInterval(async () => {
      setIsRefreshing(true);
      await fetchApi();
      if (!cancelled) {
        setIsRefreshing(false);
        setCountdown(INTERVAL_SECONDS);
      }
    }, INTERVAL_SECONDS * 1000);

    // 1s countdown ticker
    const tickerId = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? INTERVAL_SECONDS : prev - 1));
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      clearInterval(tickerId);
    };
  }, []);

  return {
    health,
    isRefreshing,
    countdown,
  };
}
