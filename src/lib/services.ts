export type ServiceId = "sso" | "malas";

export interface ServiceDef {
  id: ServiceId;
  name: string;
  tagline: string;
  description: string;
  url: string;
  repo: string;
}

export const services: ServiceDef[] = [
  {
    id: "sso",
    name: "SSO",
    tagline: "Identity & access",
    description:
      "Single sign-on for every White Archive service. One account, one login, access to the whole archive.",
    url: process.env.NEXT_PUBLIC_SSO_URL ?? "https://sso.suryatmaja.dev",
    repo: "https://github.com/srytmj/sso.whitearchive",
  },
  {
    id: "malas",
    name: "Malas",
    tagline: "Core service",
    description:
      "Malas is one of the core microservices behind White Archive, reachable once you're signed in.",
    url: process.env.NEXT_PUBLIC_MALAS_URL ?? "https://malas.suryatmaja.dev",
    repo: "https://github.com/srytmj/malas",
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
