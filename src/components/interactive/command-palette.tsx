"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, ShieldCheck, Sparkles, BookOpen, Activity, Command, X } from "lucide-react";
import { services } from "@/lib/services";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  ShieldCheck,
  Sparkles,
  BookOpen,
  Activity,
};

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter services
  const filtered = useMemo(() => {
    if (!query.trim()) return services;
    const q = query.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [query]);

  // Ensure selected index is clamped
  const activeIndex = selectedIndex >= filtered.length ? 0 : selectedIndex;

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        const target = filtered[activeIndex];
        if (target.url && target.url !== "#") {
          window.open(target.url, "_blank");
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, activeIndex, onClose]);

  // Handle number shortcuts (1-9)
  useEffect(() => {
    if (!isOpen) return;

    function handleNumberKey(e: KeyboardEvent) {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= filtered.length) {
        const item = filtered[num - 1];
        if (item && item.url && item.url !== "#") {
          e.preventDefault();
          window.open(item.url, "_blank");
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleNumberKey);
    return () => window.removeEventListener("keydown", handleNumberKey);
  }, [isOpen, filtered, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-28">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-foreground/15 bg-background shadow-2xl shadow-foreground/5 dark:shadow-black/50"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3.5">
              <Search className="h-5 w-5 text-foreground/40 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Jump to microservice, portal, or doc..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedIndex(0);
                  }}
                  className="rounded p-1 text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-1 rounded border border-foreground/15 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono text-foreground/50">
                <span>ESC</span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-foreground/40">
                  No service found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-medium tracking-wider uppercase text-foreground/40">
                    Services ({filtered.length})
                  </div>
                  {filtered.map((item, index) => {
                    const Icon = iconMap[item.iconName] || Sparkles;
                    const isSelected = index === activeIndex;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          if (item.url && item.url !== "#") {
                            window.open(item.url, "_blank");
                            onClose();
                          }
                        }}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-foreground/10 text-foreground"
                            : "hover:bg-foreground/5 text-foreground/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${item.accent.iconBg}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{item.name}</span>
                              <span
                                className={`rounded-full border px-1.5 py-0.2 text-[10px] font-mono capitalize ${item.accent.badge}`}
                              >
                                {item.lifecycle}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/50 truncate">{item.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline-block rounded border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono text-foreground/40">
                            [{index + 1}]
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Hints */}
            <div className="flex items-center justify-between border-t border-foreground/10 bg-foreground/[0.02] px-4 py-2 text-[11px] text-foreground/45">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-foreground/15 bg-foreground/5 px-1 font-mono">↑</kbd>
                  <kbd className="rounded border border-foreground/15 bg-foreground/5 px-1 font-mono">↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-foreground/15 bg-foreground/5 px-1 font-mono">↵</kbd> open
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="rounded border border-foreground/15 bg-foreground/5 px-1 font-mono">[1-9]</kbd> quick jump
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="h-3 w-3" />
                <span>White Archive</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
