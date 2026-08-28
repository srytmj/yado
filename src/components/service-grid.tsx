"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Code2 } from "lucide-react";
import { services } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
import { TiltCard } from "@/components/interactive/tilt-card";
import { useHealth } from "@/hooks/use-health";

export function ServiceGrid() {
  const health = useHealth();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Services</h2>
          <p className="mt-2 text-sm text-foreground/50">Live microservices behind White Archive.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {services.map((service, i) => {
          const status = health?.services?.[service.id]?.status ?? "unknown";
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard className="relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-7 transition-colors hover:border-foreground/20 hover:bg-foreground/[0.06] sm:p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-foreground">{service.name}</h3>
                      <StatusDot status={status} />
                    </div>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-foreground/40">{service.tagline}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-foreground/55">{service.description}</p>

                <div className="mt-6 flex items-center gap-3 text-sm">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground transition-[gap] group-hover:gap-1.5"
                  >
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={service.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground/40 transition-colors hover:text-foreground/70"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    Source
                  </a>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
