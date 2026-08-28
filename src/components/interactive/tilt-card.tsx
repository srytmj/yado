"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createAnimatable, type AnimatableObject } from "animejs";
import { cn } from "@/lib/utils";

/**
 * Cursor-tracking glare + a subtle hover lift.
 *
 * Deliberately 2D-only (no `perspective` / `rotateX` / `rotateY`): a
 * permanent 3D transform context forces Chrome/WebKit to rasterize the
 * card onto its own layer even at rest, which blurred small rounded
 * elements (the status dot) and added GPU compositing overhead that
 * showed up as scroll jank. `scale` alone avoids both.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || window.matchMedia("(pointer: coarse)").matches) return;

    const animatable: AnimatableObject = createAnimatable(wrap, { scale: 1, ease: "out(3)", duration: 400 });

    function handleMove(e: MouseEvent) {
      const rect = wrap!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      animatable.scale(1.012);
      wrap!.style.setProperty("--mx", `${px * 100}%`);
      wrap!.style.setProperty("--my", `${py * 100}%`);
    }
    function handleLeave() {
      animatable.scale(1);
    }

    wrap.addEventListener("mousemove", handleMove);
    wrap.addEventListener("mouseleave", handleLeave);
    return () => {
      wrap.removeEventListener("mousemove", handleMove);
      wrap.removeEventListener("mouseleave", handleLeave);
      animatable.revert();
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("group relative", className)}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--color-foreground) 10%, transparent), transparent 60%)",
        }}
      />
    </div>
  );
}
