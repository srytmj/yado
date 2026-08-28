"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createAnimatable, type AnimatableObject } from "animejs";

/**
 * Wraps its child in a magnetic hover effect: the element is pulled toward
 * the cursor and eases back into place on mouse leave.
 */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const animatable: AnimatableObject = createAnimatable(el, { x: 0, y: 0, ease: "out(3)", duration: 600 });

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      animatable.x((e.clientX - (rect.left + rect.width / 2)) * strength);
      animatable.y((e.clientY - (rect.top + rect.height / 2)) * strength);
    }
    function handleLeave() {
      animatable.x(0, 700, "outElastic(1, 0.5)");
      animatable.y(0, 700, "outElastic(1, 0.5)");
    }

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      animatable.revert();
    };
  }, [strength]);

  return (
    <div ref={ref} className="inline-block will-change-transform">
      {children}
    </div>
  );
}
