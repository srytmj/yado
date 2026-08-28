"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const order = ["light", "dark", "system"] as const;
const icons = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid rendering theme-dependent state before hydration to prevent mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag to defer theme-dependent UI past hydration
    setMounted(true);
  }, []);

  const current = mounted ? (theme as (typeof order)[number] | undefined) ?? "system" : "system";
  const Icon = icons[current];

  return (
    <button
      type="button"
      aria-label={`Theme: ${current}. Click to switch.`}
      onClick={() => setTheme(order[(order.indexOf(current) + 1) % order.length])}
      className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 transition hover:bg-foreground/10 hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
