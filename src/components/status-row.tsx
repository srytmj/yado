"use client";

import { StatusDot } from "@/components/status-dot";
import { useCountUp } from "@/hooks/use-count-up";
import type { ServiceDef } from "@/lib/services";

type Status = "up" | "down" | "unknown";

export function StatusRow({
  service,
  status,
  latencyMs,
}: {
  service: ServiceDef;
  status: Status;
  latencyMs: number | null;
}) {
  const animatedLatency = useCountUp(status === "up" ? latencyMs : null);

  return (
    <li className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <StatusDot status={status} />
        <span className="text-sm text-foreground/80">{service.name}</span>
      </div>
      <span className="text-xs text-foreground/40 tabular-nums">
        {status === "unknown" ? "—" : status === "up" ? `${animatedLatency ?? 0}ms` : "unreachable"}
      </span>
    </li>
  );
}
