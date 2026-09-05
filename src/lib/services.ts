export type ServiceId = "sso" | "malas" | "pore" | "telemetry";

export type ServiceCategory = "Identity" | "Core" | "Reader" | "DevTools" | "Experimental";
export type ServiceLifecycle = "production" | "staging" | "development";

export interface QuickLink {
  label: string;
  url: string;
}

export interface ServiceDef {
  id: ServiceId;
  name: string;
  tagline: string;
  description: string;
  url: string;
  repo: string;
  category: ServiceCategory;
  lifecycle: ServiceLifecycle;
  version: string;
  progress?: number;
  iconName: "ShieldCheck" | "Sparkles" | "BookOpen" | "Activity";
  accent: {
    badge: string;
    borderHover: string;
    glow: string;
    iconBg: string;
  };
  quickLinks?: QuickLink[];
}

export const services: ServiceDef[] = [
  {
    id: "sso",
    name: "SSO",
    tagline: "Identity & Access",
    description:
      "Centralized OAuth2 identity provider securing all services in the White Archive network.",
    url: process.env.NEXT_PUBLIC_SSO_URL ?? "https://sso.suryatmaja.dev",
    repo: "https://github.com/srytmj/sso.whitearchive",
    category: "Identity",
    lifecycle: "production",
    version: "v1.2.4",
    iconName: "ShieldCheck",
    accent: {
      badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",
      borderHover: "hover:border-sky-500/40",
      glow: "from-sky-500/10 via-transparent to-transparent",
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    quickLinks: [
      { label: "Portal", url: "https://sso.suryatmaja.dev" },
      { label: "Docs", url: "https://github.com/srytmj/sso.whitearchive#readme" },
    ],
  },
  {
    id: "malas",
    name: "Malas",
    tagline: "Core Service",
    description:
      "Core backend service for media catalog indexing, reading workflows, and data orchestration.",
    url: process.env.NEXT_PUBLIC_MALAS_URL ?? "https://malas.suryatmaja.dev",
    repo: "https://github.com/srytmj/malas",
    category: "Core",
    lifecycle: "production",
    version: "v1.0.0",
    iconName: "Sparkles",
    accent: {
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      borderHover: "hover:border-emerald-500/40",
      glow: "from-emerald-500/10 via-transparent to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    quickLinks: [
      { label: "Launch", url: "https://malas.suryatmaja.dev" },
      { label: "API", url: "https://github.com/srytmj/malas#api" },
    ],
  },
  {
    id: "pore",
    name: "Pore Reader",
    tagline: "Viewer & Inspector",
    description:
      "Digital reading engine and visual inspector for manga, EPUB, and signal archives.",
    url: "#",
    repo: "https://github.com/srytmj/whitearchive",
    category: "Reader",
    lifecycle: "development",
    version: "v0.4.0-alpha",
    progress: 70,
    iconName: "BookOpen",
    accent: {
      badge: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      borderHover: "hover:border-purple-500/40",
      glow: "from-purple-500/10 via-transparent to-transparent",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    quickLinks: [
      { label: "Docs", url: "/docs" },
      { label: "Roadmap", url: "https://github.com/srytmj/whitearchive/tree/main/docs" },
    ],
  },
  {
    id: "telemetry",
    name: "Telemetry",
    tagline: "Health & Monitoring",
    description:
      "Automated uptime tracking, response latency, and service availability monitors.",
    url: "#status",
    repo: "https://github.com/srytmj/whitearchive",
    category: "DevTools",
    lifecycle: "staging",
    version: "v0.9.1-rc",
    progress: 90,
    iconName: "Activity",
    accent: {
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      borderHover: "hover:border-amber-500/40",
      glow: "from-amber-500/10 via-transparent to-transparent",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    quickLinks: [
      { label: "Endpoint", url: "/api/health" },
      { label: "Dashboard", url: "#status" },
    ],
  },
];

export const ssoConfig = {
  clientId: process.env.NEXT_PUBLIC_SSO_CLIENT_ID ?? "whitearchive-landing",
  redirectUri: process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ?? "",
  authorizeUrl: `${process.env.NEXT_PUBLIC_SSO_URL ?? "https://sso.suryatmaja.dev"}/oauth/authorize`,
};

export function buildSsoLoginUrl() {
  const url = new URL(ssoConfig.authorizeUrl);
  url.searchParams.set("client_id", ssoConfig.clientId);
  url.searchParams.set("response_type", "code");
  if (ssoConfig.redirectUri) {
    url.searchParams.set("redirect_uri", ssoConfig.redirectUri);
  }
  return url.toString();
}
