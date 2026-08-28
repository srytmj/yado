"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

/**
 * Tweens a number from its previous value to `target` using anime.js.
 * Returns `null` while `target` is null (nothing to show yet).
 */
export function useCountUp(target: number | null, duration = 700) {
  const [display, setDisplay] = useState<number | null>(target);
  const objRef = useRef({ value: target ?? 0 });

  useEffect(() => {
    if (target == null) return;
    const obj = objRef.current;
    const animation = animate(obj, {
      value: target,
      duration,
      ease: "outExpo",
      onUpdate: () => setDisplay(Math.round(obj.value)),
    });
    return () => {
      animation.revert();
    };
  }, [target, duration]);

  return display;
}
