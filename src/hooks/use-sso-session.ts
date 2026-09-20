"use client";

import { useSyncExternalStore, useCallback } from "react";
import { buildSsoLoginUrl } from "@/lib/services";

export interface UserSession {
  name: string;
  username: string;
  email: string;
  role: string;
}

const STORAGE_KEY = "yado_sso_session";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("yado-session-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("yado-session-change", callback);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function useSsoSession() {
  const sessionRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let session: UserSession | null = null;
  if (sessionRaw) {
    try {
      session = JSON.parse(sessionRaw);
    } catch {
      session = null;
    }
  }

  const notifyChange = () => {
    window.dispatchEvent(new Event("yado-session-change"));
  };

  const login = useCallback(async () => {
    window.location.href = await buildSsoLoginUrl();
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      notifyChange();
    } catch {
      // ignore
    }
  }, []);

  return {
    session,
    login,
    logout,
  };
}
