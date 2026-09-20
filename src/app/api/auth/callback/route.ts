import { NextRequest, NextResponse } from "next/server";

const SSO_URL = process.env.NEXT_PUBLIC_SSO_URL ?? "https://sso.yado.my.id";
const CLIENT_ID = process.env.NEXT_PUBLIC_SSO_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SSO_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ?? "";

interface SsoUser {
  name: string;
  username: string;
  email: string;
  role: { name: string; slug: string };
}

export async function POST(req: NextRequest) {
  if (!CLIENT_SECRET) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const { code, code_verifier } = await req.json();
  if (!code || !code_verifier) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const tokenRes = await fetch(`${SSO_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier,
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    console.error("[auth/callback] token exchange failed", tokenRes.status, detail);
    return NextResponse.json({ error: "token_exchange_failed", detail }, { status: 502 });
  }

  const { access_token } = await tokenRes.json();

  const userRes = await fetch(`${SSO_URL}/api/user`, {
    headers: { Authorization: `Bearer ${access_token}`, Accept: "application/json" },
  });

  if (!userRes.ok) {
    const detail = await userRes.text();
    console.error("[auth/callback] user fetch failed", userRes.status, detail);
    return NextResponse.json({ error: "user_fetch_failed" }, { status: 502 });
  }

  const user: SsoUser = await userRes.json();

  return NextResponse.json({
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role?.name ?? user.role?.slug ?? "User",
  });
}
