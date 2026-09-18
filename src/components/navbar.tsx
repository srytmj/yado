"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { Search, Layers } from "lucide-react";
import { openCommandPalette } from "@/hooks/use-command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { SsoProfileWidget } from "@/components/sso-profile-widget";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = (e: React.MouseEvent) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSmoothScroll = (targetId: string) => (e: React.MouseEvent) => {
    if (window.location.pathname !== "/") return;

    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(targetId, { offset: -30, duration: 1.2 });
    } else {
      const el = document.querySelector(targetId);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-foreground/10 bg-background/80 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Kiri: Brand & Navigasi Halaman */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80 cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Yado</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Hub Operational" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-foreground/60">
            <Link
              href="/#services"
              onClick={handleSmoothScroll("#services")}
              className="transition-colors hover:text-foreground cursor-pointer"
            >
              Services
            </Link>
            <Link
              href="/status"
              className="transition-colors hover:text-foreground"
            >
              System Status
            </Link>
            <Link
              href="/docs"
              className="transition-colors hover:text-foreground"
            >
              Documentation
            </Link>
          </nav>
        </div>

        {/* Kanan: Search Trigger, SSO Profile Widget, dan Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={openCommandPalette}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs text-foreground/60 transition-all hover:text-foreground ${
              isScrolled
                ? "border-foreground/10 bg-foreground/[0.03] hover:border-foreground/25"
                : "border-foreground/15 bg-background/40 backdrop-blur-sm hover:border-foreground/30"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-foreground/40" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="rounded border border-foreground/15 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono text-foreground/50">
              Ctrl K
            </kbd>
          </button>

          <SsoProfileWidget />

          <div className="border-l border-foreground/10 pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
