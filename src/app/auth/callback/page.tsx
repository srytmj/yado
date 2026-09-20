"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PKCE_VERIFIER_KEY, OAUTH_STATE_KEY } from "@/lib/services";

const STORAGE_KEY = "yado_sso_session";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const ssoError = searchParams.get("error");

      if (ssoError) {
        setError(searchParams.get("error_description") ?? ssoError);
        return;
      }

      const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
      const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      sessionStorage.removeItem(PKCE_VERIFIER_KEY);

      if (!code || !verifier || !state || state !== expectedState) {
        setError("Invalid or expired login request. Please try signing in again.");
        return;
      }

      const res = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, code_verifier: verifier }),
      });

      if (!res.ok) {
        setError("Sign-in failed. Please try again.");
        return;
      }

      const user = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event("yado-session-change"));
      router.replace("/");
    }

    run();
  }, [router, searchParams]);

  return (
    <p className="text-sm text-foreground/60">
      {error ? error : "Signing you in…"}
    </p>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<p className="text-sm text-foreground/60">Signing you in…</p>}>
        <AuthCallbackInner />
      </Suspense>
    </div>
  );
}
