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
  Hammer,
} from "lucide-react";
import { services, lifecycleAccent, ServiceLifecycle } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
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
      { id: "all", label: "All rooms", count: counts.all },
      { id: "production", label: "Production", count: counts.production },
      { id: "staging", label: "Staging", count: counts.staging },
      { id: "development", label: "Development", count: counts.development },
    ],
    [counts]
  );

  const filteredServices = useMemo(() => {
    if (activeTab === "all") return services;
    return services.filter((s) => s.lifecycle === activeTab);
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-5xl px-6 py-4"
    >
      {/* Header & Filter Tabs */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-foreground/45 mb-2">
            Room Directory
          </div>
          <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
            Services & Portals
          </h2>
          <p className="mt-1.5 text-sm text-foreground/50">
            Every service currently running under the Yado roof.
          </p>
        </div>

        {/* Filter Tabs - thin underline, not a filled pill */}
        <div className="flex flex-wrap items-center gap-5 border-b border-hairline pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 pb-2.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                  isActive ? "text-foreground" : "text-foreground/45 hover:text-foreground/70"
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] text-foreground/35">({tab.count})</span>
                {isActive && (
                  <motion.div
                    layoutId="activeFilterUnderline"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute -bottom-px left-0 right-0 h-[1.5px] bg-foreground"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room List */}
      <motion.div layout="position" className="border-t border-hairline">
        <AnimatePresence mode="sync">
          {filteredServices.map((service) => {
            const statusEntry = health?.services?.[service.id];
            const status = statusEntry?.status ?? "unknown";
            const latency = statusEntry?.latencyMs;
            const Icon = iconMap[service.iconName] || Sparkles;
            const accent = lifecycleAccent[service.lifecycle];

            return (
              <motion.div
                layout="position"
                key={service.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
                className="group border-b border-hairline py-7 transition-colors hover:bg-foreground/[0.015]"
              >
                <div className="flex flex-col gap-5 px-1 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                  {/* Room name, status, description */}
                  <div className="flex gap-4 sm:max-w-md">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground/35" strokeWidth={1.5} />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-serif text-lg text-foreground">{service.name}</h3>
                        <StatusDot status={status} />
                        <span className={`border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide ${accent.badge}`}>
                          {accent.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-foreground/40">
                        {service.tagline}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                        {service.description}
                      </p>

                      {service.lifecycle === "development" && service.progress && (
                        <div className="mt-4 max-w-xs">
                          <div className="flex items-center justify-between text-[11px] text-foreground/45 mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Hammer className="h-3 w-3" strokeWidth={1.5} />
                              Build progress
                            </span>
                            <span className="font-mono">{service.progress}%</span>
                          </div>
                          <div className="h-px w-full bg-hairline">
                            <div className="h-px bg-indigo" style={{ width: `${service.progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry + actions */}
                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <div className="flex items-center gap-4 text-[11px] font-mono text-foreground/40">
                      <span>{latency !== null && latency !== undefined ? `${latency}ms` : "-"}</span>
                      <span>{service.version}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {service.url && service.url !== "#" ? (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-foreground"
                        >
                          <span className="border-b border-transparent group-hover/link:border-foreground/40">Open</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" strokeWidth={1.5} />
                        </a>
                      ) : (
                        <span className="text-foreground/35">In development</span>
                      )}

                      <a
                        href={service.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-foreground/45 transition-colors hover:text-foreground/80"
                      >
                        <Code2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span>Source</span>
                      </a>
                    </div>

                    {service.quickLinks && service.quickLinks.length > 0 && (
                      <div className="flex items-center gap-3">
                        {service.quickLinks.map((link) => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-foreground/40 hover:text-foreground/70 hover:underline underline-offset-4"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
