"use client";

import { useEffect, useRef } from "react";
import { createAnimatable, type AnimatableObject } from "animejs";

const SIZE = 560;

/**
 * A soft glow that trails the cursor with spring-like lag, powered by
 * anime.js's `createAnimatable` (continuously-retargetable tween).
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const animatable: AnimatableObject = createAnimatable(el, {
      x: -SIZE,
      y: -SIZE,
      ease: "out(3)",
      duration: 900,
    });

    function handleMove(e: PointerEvent) {
      animatable.x(e.clientX - SIZE / 2);
      animatable.y(e.clientY - SIZE / 2);
      el!.style.opacity = "1";
    }
    function handleLeave() {
      el!.style.opacity = "0";
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      animatable.revert();
    };
  }, []);

  return (
    <div
      aria-hidden
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0 transition-opacity duration-500"
      style={{
        width: SIZE,
        height: SIZE,
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--color-foreground) 12%, transparent) 0%, transparent 70%)",
        filter: "blur(10px)",
      }}
    />
  );
}
