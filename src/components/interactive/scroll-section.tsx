"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A full-viewport panel. Paired with `<SectionSnap />`, Lenis eases the
 * page to rest on whichever panel is nearest once scrolling settles — no
 * native CSS scroll-snap involved.
 */
export function ScrollSection({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-panel flex min-h-screen w-full flex-col items-center", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ amount: 0.6, once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full flex-1 flex-col items-center justify-center"
      >
        {children}
      </motion.div>
    </section>
  );
}
