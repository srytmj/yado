"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Code2 } from "lucide-react";
import { services } from "@/lib/services";
import { StatusDot } from "@/components/status-dot";
import { useHealth } from "@/hooks/use-health";

export function ServiceGrid() {
  const health = useHealth();

  return (
    <section id="services" className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Services</h2>
          <p className="mt-2 text-sm text-white/50">Live microservices behind White Archive.</p>
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
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-white">{service.name}</h3>
                    <StatusDot status={status} />
                  </div>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-white/40">{service.tagline}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/55">{service.description}</p>

              <div className="mt-6 flex items-center gap-3 text-sm">
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-white transition group-hover:gap-1.5"
                >
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={service.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white/40 transition hover:text-white/70"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Source
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
