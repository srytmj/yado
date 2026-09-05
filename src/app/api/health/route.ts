import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Status = "up" | "down" | "unknown";

async function ping(url: string | undefined, timeoutMs = 4000): Promise<{ status: Status; latencyMs: number | null }> {
  if (!url) return { status: "unknown", latencyMs: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    return { status: res.ok ? "up" : "down", latencyMs: Date.now() - started };
  } catch {
    return { status: "down", latencyMs: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const [sso, malas] = await Promise.all([
    ping(process.env.SSO_HEALTH_URL),
    ping(process.env.MALAS_HEALTH_URL),
  ]);

  // Telemetry endpoint self-health & pore development status
  const telemetry = { status: "up" as Status, latencyMs: 8 };
  const pore = { status: "unknown" as Status, latencyMs: null };

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    services: { sso, malas, telemetry, pore },
  });
}
