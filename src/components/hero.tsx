"use client";

import { motion } from "framer-motion";
import { SsoLoginButton } from "@/components/sso-login-button";
import { Magnetic } from "@/components/interactive/magnetic";
import { AnimatedHeadline } from "@/components/interactive/animated-headline";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-8 text-center"
    >
      <motion.div
        variants={item}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs text-foreground/60"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        All systems accessible via SSO
      </motion.div>

      <motion.h1
        variants={item}
        className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
      >
        <AnimatedHeadline text="One archive." delay={300} className="inline-block" />
        <br />
        <span className="inline-block bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
          Every service, one door.
        </span>
      </motion.h1>

      <motion.p variants={item} className="mt-6 max-w-xl text-balance text-base text-foreground/50 sm:text-lg">
        White Archive is the front door to a set of microservices — sign in once, reach
        everything. Explore what&apos;s live below.
      </motion.p>

      <motion.div variants={item} className="mt-10 flex items-center gap-3">
        <Magnetic>
          <SsoLoginButton />
        </Magnetic>
        <Magnetic strength={0.25}>
          <a
            href="#services"
            className="inline-block rounded-full border border-foreground/15 px-6 py-3 text-base font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Browse services
          </a>
        </Magnetic>
      </motion.div>
    </motion.section>
  );
}
