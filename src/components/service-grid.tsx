"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Code2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Activity,
  Layers,
  ExternalLink,
  Clock,
  CheckCircle2,
  Hammer,
} from "lucide-react";
import { services, ServiceLifecycle } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
import { TiltCard } from "@/components/interactive/tilt-card";
import { useHealth } from "@/hooks/use-health";

const iconMap = {
  ShieldCheck,
  Sparkles,
  BookOpen,
  Activity,
};

type FilterTab = "all" | ServiceLifecycle;

interface TabConfig {
  id: FilterTab;
  label: string;
  count: number;
  dotColor?: string;
}

export function ServiceGrid() {
  const { health } = useHealth();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const counts = useMemo(() => {
    return {
      all: services.length,
      production: services.filter((s) => s.lifecycle === "production").length,
      staging: services.filter((s) => s.lifecycle === "staging").length,
      development: services.filter((s) => s.lifecycle === "development").length,
    };
  }, []);

  const tabs: TabConfig[] = useMemo(
    () => [
      { id: "all", label: "All", count: counts.all },
      { id: "production", label: "Production", count: counts.production, dotColor: "bg-emerald-500" },
      { id: "development", label: "Development", count: counts.development, dotColor: "bg-purple-500" },
      { id: "staging", label: "Staging", count: counts.staging, dotColor: "bg-amber-500" },
    ],
    [counts]
  );

  const filteredServices = useMemo(() => {
    if (activeTab === "all") return services;
    return services.filter((s) => s.lifecycle === activeTab);
  }, [activeTab]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-4">
      {/* Header & Filter Tabs */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground/45 mb-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>Service Registry</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Services & Portals
          </h2>
          <p className="mt-1 text-sm text-foreground/50">
            Active web portals and microservices running on the Yado network.
          </p>
        </div>

        {/* Filter Pills with Smooth Sliding Highlight */}
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-1.5 backdrop-blur-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  isActive ? "text-background" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-xl bg-foreground shadow-sm"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.dotColor && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-background" : tab.dotColor
                      }`}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? "text-background/70" : "text-foreground/40"
                    }`}
                  >
                    ({tab.count})
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bento Grid */}
      <motion.div layout="position" className="grid gap-6 sm:grid-cols-2">
        <AnimatePresence mode="sync">
          {filteredServices.map((service) => {
            const statusEntry = health?.services?.[service.id];
            const status = statusEntry?.status ?? "unknown";
            const latency = statusEntry?.latencyMs;
            const Icon = iconMap[service.iconName] || Sparkles;

            return (
              <motion.div
                layout="position"
                key={service.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                  layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                <TiltCard
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-7 transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.04] hover:shadow-xl hover:shadow-foreground/[0.02] ${service.accent.borderHover}`}
                >
                  {/* Subtle Accent Glow */}
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${service.accent.glow} blur-2xl transition-opacity group-hover:opacity-100 opacity-60`}
                  />

                  {/* Top Row: Icon, Title, Status, and Version */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${service.accent.iconBg}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground tracking-tight">
                              {service.name}
                            </h3>
                            <StatusDot status={status} />
                          </div>
                          <p className="text-xs uppercase tracking-wider text-foreground/45">
                            {service.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Version & Lifecycle Badge */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono capitalize tracking-wide ${service.accent.badge}`}
                        >
                          {service.lifecycle}
                        </span>
                        <span className="text-[10px] font-mono text-foreground/40">
                          {service.version}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-4 text-sm leading-relaxed text-foreground/60">
                      {service.description}
                    </p>

                    {/* Progress Bar for Services in Development */}
                    {service.lifecycle === "development" && service.progress && (
                      <div className="mt-5 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-3">
                        <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Hammer className="h-3.5 w-3.5" />
                            Build Progress
                          </span>
                          <span className="font-mono">{service.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            style={{ width: `${service.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Telemetry Bar */}
                    <div className="mt-5 flex items-center gap-4 text-xs text-foreground/40 border-t border-foreground/5 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Latency: {latency !== null && latency !== undefined ? `${latency}ms` : "Active"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-foreground/40" />
                        <span>Category: {service.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="mt-6 border-t border-foreground/10 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-sm">
                        {service.url && service.url !== "#" ? (
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-transform active:scale-95 hover:opacity-90"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground/40">
                            <span>In Development</span>
                          </span>
                        )}

                        <a
                          href={service.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/[0.02] px-3.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          <span>Source</span>
                        </a>
                      </div>

                      {/* Quick Links */}
                      {service.quickLinks && service.quickLinks.length > 0 && (
                        <div className="flex items-center gap-2">
                          {service.quickLinks.map((link) => (
                            <a
                              key={link.label}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-foreground/45 underline-offset-4 hover:underline hover:text-foreground/80 flex items-center gap-0.5"
                            >
                              <span>{link.label}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
