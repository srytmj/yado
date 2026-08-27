import { cn } from "@/lib/utils";

type Status = "up" | "down" | "unknown";

const styles: Record<Status, { dot: string; ring: string }> = {
  up: { dot: "bg-emerald-400", ring: "bg-emerald-400/40" },
  down: { dot: "bg-red-400", ring: "bg-red-400/40" },
  unknown: { dot: "bg-white/30", ring: "bg-white/10" },
};

export function StatusDot({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span className="relative inline-flex h-2 w-2">
      {status === "up" && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full", s.ring)} />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
    </span>
  );
}
