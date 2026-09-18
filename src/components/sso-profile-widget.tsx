"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ExternalLink, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";
import { useSsoSession } from "@/hooks/use-sso-session";

export function SsoProfileWidget() {
  const { session, login, logout, setDemoSession } = useSsoSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // State: Guest (Not Signed In)
  if (!session) {
    return (
      <div className="relative flex items-center gap-1.5">
        <button
          onClick={login}
          className="inline-flex items-center gap-1.5 bg-indigo px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">SSO Sign In</span>
        </button>

        {/* Demo simulation button for UI inspection */}
        <button
          onClick={() => setDemoSession(true)}
          className="hidden sm:inline-flex border border-hairline px-1.5 py-1 text-[10px] font-mono text-foreground/40 hover:text-foreground hover:bg-foreground/5 cursor-pointer"
          title="Preview UI with an authenticated SSO session"
        >
          Simulate Session
        </button>
      </div>
    );
  }

  // State: Authenticated
  const initial = session.name.charAt(0).toUpperCase();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 border border-hairline p-1 pr-2.5 text-xs transition-colors hover:border-foreground/30"
        aria-expanded={isOpen}
      >
        <div className="relative flex h-6 w-6 items-center justify-center bg-indigo text-[11px] font-semibold text-background">
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-moss" />
        </div>
        <span className="hidden sm:inline-block max-w-[100px] truncate font-medium text-foreground">
          {session.name}
        </span>
        <ChevronDown className="h-3 w-3 text-foreground/40" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-64 border border-hairline bg-background p-2 shadow-lg backdrop-blur-xl z-50"
          >
            {/* User Details */}
            <div className="border-b border-hairline p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground text-sm truncate">{session.name}</span>
                <span className="flex items-center gap-1 border border-moss/30 bg-moss-soft px-1.5 py-0.2 text-[10px] font-mono text-moss">
                  <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={1.5} />
                  SSO Active
                </span>
              </div>
              <p className="text-xs text-foreground/50 truncate font-mono">{session.email}</p>
              <p className="mt-1 text-[11px] text-foreground/40">{session.role}</p>
            </div>

            {/* Menu Actions */}
            <div className="py-1 text-xs">
              <a
                href="https://sso.yado.my.id"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-foreground/75 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                <span>Manage in SSO Portal</span>
                <ExternalLink className="h-3.5 w-3.5 text-foreground/40" strokeWidth={1.5} />
              </a>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-clay hover:bg-clay-soft transition-colors cursor-pointer"
              >
                <span>Sign Out</span>
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
