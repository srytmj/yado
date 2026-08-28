"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import Snap from "lenis/snap";

/**
 * Gently eases the page to rest on the nearest `.scroll-panel` section once
 * the user stops scrolling — powered by Lenis's own JS-driven snap (not
 * native CSS `scroll-snap-type: mandatory`, which fights every wheel tick
 * and was the main source of scroll jank).
 */
export function SectionSnap() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const snap = new Snap(lenis, { type: "proximity", duration: 0.9, distanceThreshold: "40%" });
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".scroll-panel"));
    const removeElements = snap.addElements(elements);

    return () => {
      removeElements();
      snap.destroy();
    };
  }, [lenis]);

  return null;
}
