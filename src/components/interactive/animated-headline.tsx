"use client";

import { useEffect, useRef } from "react";
import { animate, split, stagger } from "animejs";

/**
 * Splits its text into characters and reveals them with a staggered
 * fall-and-settle animation via anime.js.
 */
export function AnimatedHeadline({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const splitter = split(el, { chars: true, accessible: true });
    const animation = animate(splitter.chars, {
      opacity: { from: 0, to: 1 },
      y: { from: "0.9em", to: "0em" },
      rotateZ: { from: 8, to: 0 },
      duration: 900,
      delay: stagger(18, { start: delay }),
      ease: "outExpo",
    });

    return () => {
      animation.revert();
      splitter.revert();
    };
  }, [text, delay]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
