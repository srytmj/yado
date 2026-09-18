"use client";

import { motion } from "framer-motion";
import { Search, Shield, ArrowRight, Activity, Server } from "lucide-react";
import { SsoLoginButton } from "@/components/sso-login-button";
import { AnimatedHeadline } from "@/components/interactive/animated-headline";
import { openCommandPalette } from "@/hooks/use-command-palette";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 text-center"
    >
      {/* Status Pill */}
      <motion.div
        variants={item}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-1.5 text-xs text-foreground/70 backdrop-blur-md"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <span className="font-medium">Launcher Hub</span>
        <span className="text-foreground/30">•</span>
        <span className="text-foreground/50">SSO Ready</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={item}
        className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl leading-[1.12]"
      >
        <AnimatedHeadline text="One archive." delay={200} className="inline-block" />
        <br />
        <span className="inline-block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/40 bg-clip-text text-transparent">
          Every service, one door.
        </span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        variants={item}
        className="mt-8 max-w-2xl text-balance text-base text-foreground/60 sm:text-lg leading-relaxed"
      >
        Primary entry point to web applications, internal microservices, and active projects across the Yado network.
      </motion.p>

      {/* Quick Interactive Search */}
      <motion.div variants={item} className="mt-10 w-full max-w-md">
        <button
          onClick={openCommandPalette}
          className="group relative flex w-full items-center justify-between rounded-2xl border border-foreground/15 bg-foreground/[0.03] px-5 py-3.5 text-left text-sm text-foreground/50 shadow-sm backdrop-blur-sm transition-all hover:border-foreground/30 hover:bg-foreground/[0.06]"
        >
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-foreground/40 group-hover:text-foreground/80 transition-colors" />
            <span className="group-hover:text-foreground/80 transition-colors">
              Search microservices or portals...
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[11px] font-mono text-foreground/60">
            <span>Ctrl + K</span>
          </div>
        </button>
      </motion.div>

      {/* Action Buttons with Smooth Hover Animation (No jitter/getar) */}
      <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <motion.div
          whileHover={{ scale: 1.025, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <SsoLoginButton />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.025, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/50 px-6 py-3 text-base font-medium text-foreground/80 backdrop-blur-md transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <span>Browse Services</span>
            <ArrowRight className="h-4 w-4 text-foreground/50" />
          </a>
        </motion.div>
      </motion.div>

      {/* System Features */}
      <motion.div
        variants={item}
        className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-foreground/45 border-t border-foreground/10 pt-8"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-sky-400" />
          <span>OAuth2 Single Sign-On</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>Live Health Check</span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-purple-400" />
          <span>Microservices Fleet</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
