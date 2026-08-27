import Link from "next/link";
import { Archive } from "lucide-react";
import { SsoLoginButton } from "@/components/sso-login-button";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium tracking-tight text-white">
          <Archive className="h-4 w-4" />
          white archive
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/60 sm:flex">
          <a href="#services" className="transition hover:text-white">
            Services
          </a>
          <a href="#status" className="transition hover:text-white">
            Status
          </a>
        </nav>
        <SsoLoginButton size="sm" />
      </div>
    </header>
  );
}
