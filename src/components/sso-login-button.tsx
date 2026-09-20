"use client";

import { ArrowUpRight } from "lucide-react";
import { buildSsoLoginUrl } from "@/lib/services";
import { cn } from "@/lib/utils";

export function SsoLoginButton({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      onClick={async () => {
        window.location.href = await buildSsoLoginUrl();
      }}
      className={cn(
        "group inline-flex items-center gap-1.5 bg-indigo font-medium text-background transition-colors hover:bg-indigo/90 cursor-pointer",
        size === "sm" ? "px-4 py-1.5 text-sm" : "px-6 py-3 text-base",
      )}
    >
      Sign in
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
    </button>
  );
}
