"use client";

import { ArrowUpRight } from "lucide-react";
import { buildSsoLoginUrl } from "@/lib/services";
import { cn } from "@/lib/utils";

export function SsoLoginButton({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <a
      href={buildSsoLoginUrl()}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full bg-foreground font-medium text-background transition hover:bg-foreground/90",
        size === "sm" ? "px-4 py-1.5 text-sm" : "px-6 py-3 text-base",
      )}
    >
      Sign in
      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
